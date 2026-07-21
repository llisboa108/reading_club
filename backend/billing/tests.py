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
