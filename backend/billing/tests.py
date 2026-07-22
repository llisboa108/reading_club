import hashlib
import hmac
from datetime import timedelta
from unittest.mock import patch

from dateutil.relativedelta import relativedelta
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.core import mail
from django.core.management import call_command
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from . import mercadopago_service
from .models import (
    Plan,
    Subscription,
    SubscriptionStatus,
    Payment,
    PaymentMethod,
    PaymentStatus,
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


class MercadoPagoSignatureTests(TestCase):
    """Unit tests for the HMAC manifest check itself, no network involved."""

    @override_settings(MERCADOPAGO_WEBHOOK_SECRET="test-secret")
    def test_valid_signature_passes(self):
        manifest = "id:123;request-id:req-1;ts:1700000000;"
        v1 = hmac.new(b"test-secret", manifest.encode(), hashlib.sha256).hexdigest()
        x_signature = f"ts=1700000000,v1={v1}"

        self.assertTrue(
            mercadopago_service.verify_webhook_signature(x_signature, "req-1", "123")
        )

    @override_settings(MERCADOPAGO_WEBHOOK_SECRET="test-secret")
    def test_tampered_signature_fails(self):
        x_signature = "ts=1700000000,v1=deadbeef"

        self.assertFalse(
            mercadopago_service.verify_webhook_signature(x_signature, "req-1", "123")
        )

    @override_settings(MERCADOPAGO_WEBHOOK_SECRET="")
    def test_missing_secret_raises(self):
        with self.assertRaises(mercadopago_service.MercadoPagoNotConfigured):
            mercadopago_service.verify_webhook_signature("ts=1,v1=x", "req-1", "123")


class MercadoPagoPreferenceViewTests(APITestCase):
    def setUp(self):
        self.plan = Plan.objects.create(
            name="Basic", price=50, is_active=True, is_default=True
        )
        self.member = User.objects.create_user(
            email="member@example.com", password="Str0ng!Passw0rd"
        )
        self.other_member = User.objects.create_user(
            email="other@example.com", password="Str0ng!Passw0rd"
        )
        self.subscription = self.member.subscriptions.order_by("-created_at").first()
        self.payment = Payment.objects.create(
            subscription=self.subscription,
            amount=self.plan.price,
            method=PaymentMethod.MERCADOPAGO,
            due_date=timezone.now().date(),
        )

    def _url(self, payment):
        return f"/api/v1/billing/payments/{payment.id}/mercadopago-preference/"

    @patch.object(mercadopago_service, "create_payment_preference")
    def test_create_preference_returns_checkout_url(self, mock_create):
        mock_create.return_value = {"init_point": "https://mp.example/checkout/abc"}

        self.client.force_authenticate(self.member)
        response = self.client.post(self._url(self.payment))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["init_point"], "https://mp.example/checkout/abc")
        mock_create.assert_called_once()

    def test_cannot_create_preference_for_another_members_payment(self):
        self.client.force_authenticate(self.other_member)
        response = self.client.post(self._url(self.payment))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @patch.object(mercadopago_service, "create_payment_preference")
    def test_confirmed_payment_cannot_generate_new_preference(self, mock_create):
        self.payment.confirm(user=None)

        self.client.force_authenticate(self.member)
        response = self.client.post(self._url(self.payment))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        mock_create.assert_not_called()

    @patch.object(mercadopago_service, "create_payment_preference")
    def test_missing_credentials_returns_503(self, mock_create):
        mock_create.side_effect = mercadopago_service.MercadoPagoNotConfigured("no token")

        self.client.force_authenticate(self.member)
        response = self.client.post(self._url(self.payment))

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)


class MercadoPagoWebhookViewTests(APITestCase):
    url = "/api/v1/billing/mercadopago/webhook/"

    def setUp(self):
        self.plan = Plan.objects.create(
            name="Basic", price=50, is_active=True, is_default=True
        )
        self.member = User.objects.create_user(
            email="member@example.com", password="Str0ng!Passw0rd"
        )
        self.subscription = self.member.subscriptions.order_by("-created_at").first()
        self.payment = Payment.objects.create(
            subscription=self.subscription,
            amount=self.plan.price,
            method=PaymentMethod.MERCADOPAGO,
            due_date=timezone.now().date(),
        )

    def _notify(self, mp_payment_id=999):
        return self.client.post(
            f"{self.url}?type=payment&data.id={mp_payment_id}",
            HTTP_X_SIGNATURE="ts=1700000000,v1=fake",
            HTTP_X_REQUEST_ID="req-1",
        )

    @patch.object(mercadopago_service, "fetch_mp_payment")
    @patch.object(mercadopago_service, "verify_webhook_signature", return_value=True)
    def test_approved_payment_confirms_subscription(self, mock_verify, mock_fetch):
        mock_fetch.return_value = {
            "status": "approved",
            "external_reference": str(self.payment.id),
        }

        response = self._notify()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, PaymentStatus.CONFIRMED)
        self.assertEqual(self.payment.external_id, "999")

    @patch.object(mercadopago_service, "fetch_mp_payment")
    @patch.object(mercadopago_service, "verify_webhook_signature", return_value=True)
    def test_duplicate_notification_is_idempotent(self, mock_verify, mock_fetch):
        mock_fetch.return_value = {
            "status": "approved",
            "external_reference": str(self.payment.id),
        }

        self._notify()
        response = self._notify()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # confirm() should only ever have run once - refetch to be sure
        # the second call didn't re-trigger the confirmation signal.
        self.assertEqual(
            Payment.objects.get(pk=self.payment.id).status, PaymentStatus.CONFIRMED
        )

    @patch.object(mercadopago_service, "fetch_mp_payment")
    @patch.object(mercadopago_service, "verify_webhook_signature", return_value=True)
    def test_pending_mp_status_does_not_confirm(self, mock_verify, mock_fetch):
        mock_fetch.return_value = {
            "status": "pending",
            "external_reference": str(self.payment.id),
        }

        response = self._notify()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, PaymentStatus.PENDING)

    @patch.object(mercadopago_service, "verify_webhook_signature", return_value=False)
    def test_invalid_signature_is_rejected(self, mock_verify):
        response = self._notify()

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, PaymentStatus.PENDING)

    @patch.object(mercadopago_service, "fetch_mp_payment")
    def test_non_payment_topics_are_ignored(self, mock_fetch):
        response = self.client.post(f"{self.url}?type=merchant_order&data.id=1")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_fetch.assert_not_called()


class RenewSubscriptionsCommandTests(TestCase):
    def setUp(self):
        self.plan = Plan.objects.create(
            name="Basic", price=50, is_active=True, is_default=True
        )
        self.member = User.objects.create_user(
            email="member@example.com", password="Str0ng!Passw0rd"
        )
        self.subscription = self.member.subscriptions.order_by("-created_at").first()

    def test_advance_payment_links_to_new_payment_and_sends_email(self):
        advance_day = timezone.now().date() + timedelta(days=10)
        self.subscription.status = SubscriptionStatus.ACTIVE
        self.subscription.next_billing_date = advance_day
        self.subscription.save()

        call_command("renew_subscriptions")

        payment = Payment.objects.get(subscription=self.subscription)
        notification = self.member.notifications.get(type="PAYMENT")
        payment_content_type = ContentType.objects.get_for_model(Payment)

        self.assertEqual(notification.content_type, payment_content_type)
        self.assertEqual(notification.object_id, payment.id)

        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.member.email])
        self.assertIn("expira em 10 dias", mail.outbox[0].subject)

    def test_advance_payment_does_not_duplicate_on_second_run(self):
        advance_day = timezone.now().date() + timedelta(days=10)
        self.subscription.status = SubscriptionStatus.ACTIVE
        self.subscription.next_billing_date = advance_day
        self.subscription.save()

        call_command("renew_subscriptions")
        call_command("renew_subscriptions")

        self.assertEqual(Payment.objects.filter(subscription=self.subscription).count(), 1)

    def test_expired_subscription_links_to_subscription_and_sends_email(self):
        self.subscription.status = SubscriptionStatus.ACTIVE
        self.subscription.next_billing_date = timezone.now().date() - timedelta(days=1)
        self.subscription.save()

        call_command("renew_subscriptions")

        self.subscription.refresh_from_db()
        self.assertEqual(self.subscription.status, SubscriptionStatus.EXPIRED)

        notification = self.member.notifications.get(type="PAYMENT")
        subscription_content_type = ContentType.objects.get_for_model(Subscription)

        self.assertEqual(notification.content_type, subscription_content_type)
        self.assertEqual(notification.object_id, self.subscription.id)

        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("expirou", mail.outbox[0].subject)
