from dateutil.relativedelta import relativedelta
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import (
    Plan,
    Subscription,
    SubscriptionStatus,
    Payment,
    PaymentMethod,
)

User = get_user_model()


class PaymentConfirmationTests(APITestCase):
    def setUp(self):
        self.plan = Plan.objects.create(
            name="Basic", price=50, is_active=True, is_default=True
        )
        self.financial_user = User.objects.create_user(
            email="financial@example.com",
            password="Str0ng!Passw0rd",
            is_financial=True,
        )
        self.member = User.objects.create_user(
            email="member@example.com",
            password="Str0ng!Passw0rd",
        )
        # The post_save signal on User auto-creates a PENDING subscription
        # for non-staff users against the default plan.
        self.subscription = self.member.subscriptions.order_by("-created_at").first()

    def _confirm_url(self, payment):
        return f"/api/v1/billing/payments/{payment.id}/confirm/"

    def _create_pending_payment(self):
        return Payment.objects.create(
            subscription=self.subscription,
            amount=self.plan.price,
            method=PaymentMethod.PIX,
            due_date=timezone.now().date(),
        )

    def test_confirm_payment_activates_pending_subscription(self):
        # The signup signal already stamps a placeholder end_date one month
        # out on the PENDING subscription; confirmation extends from there.
        placeholder_end_date = self.subscription.end_date
        payment = self._create_pending_payment()

        self.client.force_authenticate(self.financial_user)
        response = self.client.post(
            self._confirm_url(payment), {"confirm": True}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.subscription.refresh_from_db()
        self.assertEqual(self.subscription.status, SubscriptionStatus.ACTIVE)
        expected_end = placeholder_end_date + relativedelta(months=1)
        self.assertEqual(self.subscription.end_date, expected_end)

    def test_confirm_payment_extends_active_subscription_from_current_end_date(self):
        # Subscription is already active with time remaining.
        current_end_date = timezone.now().date() + relativedelta(days=20)
        self.subscription.status = SubscriptionStatus.ACTIVE
        self.subscription.end_date = current_end_date
        self.subscription.next_billing_date = current_end_date
        self.subscription.save()

        payment = self._create_pending_payment()

        self.client.force_authenticate(self.financial_user)
        response = self.client.post(
            self._confirm_url(payment), {"confirm": True}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.subscription.refresh_from_db()
        # Regression check for the activate()/signal double-write bug: paying
        # early must extend from the current end_date, never reset to
        # today + 1 month and discard the remaining days.
        expected_end = current_end_date + relativedelta(months=1)
        self.assertEqual(self.subscription.end_date, expected_end)

    def test_non_financial_user_cannot_confirm_payment(self):
        payment = self._create_pending_payment()

        self.client.force_authenticate(self.member)
        response = self.client.post(
            self._confirm_url(payment), {"confirm": True}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class PendingPaymentsQueueTests(APITestCase):
    def setUp(self):
        self.plan = Plan.objects.create(
            name="Basic", price=50, is_active=True, is_default=True
        )
        self.financial_user = User.objects.create_user(
            email="financial@example.com",
            password="Str0ng!Passw0rd",
            is_financial=True,
        )
        self.member = User.objects.create_user(
            email="member@example.com",
            password="Str0ng!Passw0rd",
        )
        self.other_member = User.objects.create_user(
            email="other@example.com",
            password="Str0ng!Passw0rd",
        )
        self.subscription = self.member.subscriptions.order_by("-created_at").first()
        self.other_subscription = self.other_member.subscriptions.order_by("-created_at").first()

    def _pending_url(self):
        return "/api/v1/billing/payments/pending/"

    def test_financial_user_sees_pending_payments_from_other_members(self):
        payment = Payment.objects.create(
            subscription=self.other_subscription,
            amount=self.plan.price,
            method=PaymentMethod.PIX,
            due_date=timezone.now().date(),
        )

        self.client.force_authenticate(self.financial_user)
        response = self.client.get(self._pending_url())

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        emails = [p["member_email"] for p in response.data]
        self.assertIn(self.other_member.email, emails)
        self.assertEqual(response.data[0]["id"], payment.id)

    def test_confirmed_payments_are_excluded_from_pending_queue(self):
        payment = Payment.objects.create(
            subscription=self.subscription,
            amount=self.plan.price,
            method=PaymentMethod.PIX,
            due_date=timezone.now().date(),
        )
        payment.confirm(user=self.financial_user)

        self.client.force_authenticate(self.financial_user)
        response = self.client.get(self._pending_url())

        ids = [p["id"] for p in response.data]
        self.assertNotIn(payment.id, ids)

    def test_regular_member_cannot_list_pending_queue(self):
        self.client.force_authenticate(self.member)
        response = self.client.get(self._pending_url())

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class PlanManagementTests(APITestCase):
    url = "/api/v1/billing/plans/"

    def setUp(self):
        self.admin = User.objects.create_user(
            email="admin@example.com", password="Str0ng!Passw0rd", is_staff=True
        )
        self.active_plan = Plan.objects.create(
            name="Mensal", price=10, is_active=True, is_default=True
        )
        self.inactive_plan = Plan.objects.create(
            name="Antigo", price=20, is_active=False
        )
        # Created after self.active_plan so the post_save signal's default-plan
        # lookup finds it and subscribes this member to it.
        self.member = User.objects.create_user(
            email="member@example.com", password="Str0ng!Passw0rd"
        )

    def test_admin_sees_inactive_plans_member_does_not(self):
        self.client.force_authenticate(self.admin)
        admin_response = self.client.get(self.url)
        admin_ids = [p["id"] for p in admin_response.data]
        self.assertIn(self.inactive_plan.id, admin_ids)

        self.client.force_authenticate(self.member)
        member_response = self.client.get(self.url)
        member_ids = [p["id"] for p in member_response.data]
        self.assertNotIn(self.inactive_plan.id, member_ids)

    def test_setting_new_default_unsets_previous_default(self):
        self.client.force_authenticate(self.admin)
        response = self.client.patch(
            f"{self.url}{self.inactive_plan.id}/",
            {"is_default": True},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.active_plan.refresh_from_db()
        self.inactive_plan.refresh_from_db()
        self.assertFalse(self.active_plan.is_default)
        self.assertTrue(self.inactive_plan.is_default)

    def test_non_admin_cannot_create_plan(self):
        self.client.force_authenticate(self.member)
        response = self.client.post(
            self.url,
            {"name": "Pirata", "price": 1, "is_active": True},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_deleting_plan_with_subscriptions_returns_friendly_error(self):
        # The member's post_save signal already subscribed them to
        # self.active_plan, so it can't be deleted.
        self.client.force_authenticate(self.admin)
        response = self.client.delete(f"{self.url}{self.active_plan.id}/")

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertTrue(Plan.objects.filter(pk=self.active_plan.id).exists())
