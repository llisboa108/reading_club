from datetime import timedelta
from types import SimpleNamespace

from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory, APITestCase

from billing.models import (
    Payment,
    PaymentMethod,
    PaymentStatus,
    Plan,
    Subscription,
    SubscriptionStatus,
)

from .permissions import (
    IsAdmin,
    IsAdminOrReadOnly,
    IsFinancial,
    IsMemberWithActiveSubscription,
    IsNotificationOwner,
    IsOwner,
)

User = get_user_model()
factory = APIRequestFactory()


def _request(method, user):
    django_request = getattr(factory, method.lower())("/")
    request = Request(django_request)
    request.user = user
    return request


class PermissionClassTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email="admin@example.com", password="Str0ng!Passw0rd", is_staff=True
        )
        self.financial = User.objects.create_user(
            email="financial@example.com", password="Str0ng!Passw0rd", is_financial=True
        )
        self.member = User.objects.create_user(
            email="member@example.com", password="Str0ng!Passw0rd"
        )

    def test_is_admin_allows_staff_only(self):
        self.assertTrue(IsAdmin().has_permission(_request("GET", self.admin), None))
        self.assertFalse(IsAdmin().has_permission(_request("GET", self.member), None))

    def test_is_financial_allows_financial_only(self):
        self.assertTrue(IsFinancial().has_permission(_request("GET", self.financial), None))
        self.assertFalse(IsFinancial().has_permission(_request("GET", self.member), None))
        self.assertFalse(
            IsFinancial().has_permission(_request("GET", AnonymousUser()), None)
        )

    def test_is_admin_or_read_only_allows_safe_methods_for_anyone(self):
        self.assertTrue(IsAdminOrReadOnly().has_permission(_request("GET", self.member), None))
        self.assertFalse(IsAdminOrReadOnly().has_permission(_request("POST", self.member), None))
        self.assertTrue(IsAdminOrReadOnly().has_permission(_request("POST", self.admin), None))

    def test_is_owner_checks_object_user(self):
        obj = SimpleNamespace(user=self.member)
        self.assertTrue(IsOwner().has_object_permission(_request("GET", self.member), None, obj))
        self.assertFalse(IsOwner().has_object_permission(_request("GET", self.admin), None, obj))

    def test_is_notification_owner_checks_object_user(self):
        obj = SimpleNamespace(user=self.member)
        self.assertTrue(
            IsNotificationOwner().has_object_permission(_request("GET", self.member), None, obj)
        )
        self.assertFalse(
            IsNotificationOwner().has_object_permission(_request("GET", self.admin), None, obj)
        )

    def test_active_subscription_grants_access(self):
        plan = Plan.objects.create(name="Basic", price=10, is_active=True)
        today = timezone.now().date()
        Subscription.objects.create(
            user=self.member,
            plan=plan,
            status=SubscriptionStatus.ACTIVE,
            start_date=today,
            end_date=today + timedelta(days=10),
            next_billing_date=today + timedelta(days=10),
        )

        self.assertTrue(
            IsMemberWithActiveSubscription().has_permission(_request("GET", self.member), None)
        )

    def test_expired_subscription_denies_access(self):
        plan = Plan.objects.create(name="Basic", price=10, is_active=True)
        today = timezone.now().date()
        Subscription.objects.create(
            user=self.member,
            plan=plan,
            status=SubscriptionStatus.ACTIVE,
            start_date=today - timedelta(days=40),
            end_date=today - timedelta(days=10),
            next_billing_date=today - timedelta(days=10),
        )

        self.assertFalse(
            IsMemberWithActiveSubscription().has_permission(_request("GET", self.member), None)
        )

    def test_no_subscription_denies_access(self):
        self.assertFalse(
            IsMemberWithActiveSubscription().has_permission(_request("GET", self.member), None)
        )

    def test_anonymous_user_denied(self):
        self.assertFalse(
            IsMemberWithActiveSubscription().has_permission(
                _request("GET", AnonymousUser()), None
            )
        )


class AnalyticsViewTests(APITestCase):
    url = "/api/v1/analytics/"

    def setUp(self):
        self.admin = User.objects.create_user(
            email="admin@example.com", password="Str0ng!Passw0rd", is_staff=True
        )
        self.financial = User.objects.create_user(
            email="financial@example.com", password="Str0ng!Passw0rd", is_financial=True
        )
        self.plan = Plan.objects.create(
            name="Basic", price=50, is_active=True, is_default=True
        )
        # Created after self.plan exists, so the post_save signal's default
        # plan lookup finds it and auto-creates a subscription.
        self.member = User.objects.create_user(
            email="member@example.com", password="Str0ng!Passw0rd"
        )
        self.subscription = self.member.subscriptions.order_by("-created_at").first()
        self.subscription.status = SubscriptionStatus.ACTIVE
        self.subscription.end_date = timezone.now().date() + timedelta(days=10)
        self.subscription.save()

        Payment.objects.create(
            subscription=self.subscription,
            amount=50,
            method=PaymentMethod.PIX,
            status=PaymentStatus.CONFIRMED,
            due_date=timezone.now().date(),
            paid_at=timezone.now(),
        )

    def test_admin_can_access(self):
        self.client.force_authenticate(self.admin)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_financial_can_access(self):
        self.client.force_authenticate(self.financial)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_regular_member_forbidden(self):
        self.client.force_authenticate(self.member)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_kpis_reflect_seeded_data(self):
        self.client.force_authenticate(self.admin)
        response = self.client.get(self.url)

        kpis = response.data["kpis"]
        self.assertEqual(kpis["active_subscriptions"], 1)
        # financial + member are both non-staff, so both count as "members".
        self.assertEqual(kpis["total_members"], 2)
        self.assertEqual(float(kpis["mrr"]), 50.0)
        self.assertEqual(float(kpis["revenue_this_month"]), 50.0)

        current_month = timezone.now().strftime("%Y-%m")
        entry = next(
            row for row in response.data["revenue_by_month"] if row["month"] == current_month
        )
        self.assertEqual(float(entry["value"]), 50.0)

        pix_row = next(
            row for row in response.data["payments_by_method"] if row["method"] == "PIX"
        )
        self.assertEqual(pix_row["count"], 1)
