import re

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core import mail
from django.core.cache import cache
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.test import APITestCase

from .models import InviteCode

User = get_user_model()


class RegisterViewTests(APITestCase):
    url = "/api/v1/auth/register/"

    def setUp(self):
        self.invite = InviteCode.objects.create(code="WELCOME1", max_uses=1)

    def _payload(self, **overrides):
        payload = {
            "email": "member@example.com",
            "password": "Str0ng!Passw0rd",
            "invite_code": self.invite.code,
            "full_name": "Member Example",
        }
        payload.update(overrides)
        return payload

    def test_register_accepts_strong_password(self):
        response = self.client.post(self.url, self._payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="member@example.com").exists())

    def test_register_rejects_weak_password(self):
        response = self.client.post(
            self.url, self._payload(password="1234567"), format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)

    def test_register_rejects_password_similar_to_email(self):
        response = self.client.post(
            self.url,
            self._payload(
                email="joaosilva@example.com",
                password="joaosilva@example.com",
            ),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)

    def test_register_invite_code_exhausted_after_max_uses(self):
        first = self.client.post(self.url, self._payload(), format="json")
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)

        second = self.client.post(
            self.url,
            self._payload(email="other@example.com"),
            format="json",
        )

        self.assertEqual(second.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("invite_code", second.data)

        self.invite.refresh_from_db()
        self.assertEqual(self.invite.used_count, 1)
        self.assertFalse(self.invite.is_active)


class PasswordResetTests(APITestCase):
    request_url = "/api/v1/auth/password-reset/"
    confirm_url = "/api/v1/auth/password-reset-confirm/"

    def setUp(self):
        self.user = User.objects.create_user(
            email="member@example.com",
            password="Old!Passw0rd",
        )

    def test_request_with_unknown_email_returns_generic_200_and_sends_nothing(self):
        response = self.client.post(
            self.request_url, {"email": "nobody@example.com"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 0)

    def test_request_with_known_email_sends_reset_link_and_confirm_changes_password(self):
        response = self.client.post(
            self.request_url, {"email": self.user.email}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)

        body = mail.outbox[0].body
        match = re.search(r"uid=([^&\s]+)&token=([^\s]+)", body)
        self.assertIsNotNone(match)
        uid, token = match.group(1), match.group(2)

        confirm_response = self.client.post(
            self.confirm_url,
            {"uid": uid, "token": token, "new_password": "Br4nd!NewPassw0rd"},
            format="json",
        )
        self.assertEqual(confirm_response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("Br4nd!NewPassw0rd"))

    def test_confirm_with_invalid_token_returns_400(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))

        response = self.client.post(
            self.confirm_url,
            {"uid": uid, "token": "not-a-real-token", "new_password": "Br4nd!NewPassw0rd"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("Old!Passw0rd"))

    def test_confirm_rejects_weak_new_password(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = PasswordResetTokenGenerator().make_token(self.user)

        response = self.client.post(
            self.confirm_url,
            {"uid": uid, "token": token, "new_password": "1234567"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LoginRateThrottleTests(APITestCase):
    url = "/api/v1/auth/login/"

    def setUp(self):
        # DRF's AnonRateThrottle caches hit counts in the default cache,
        # which persists across tests in the same process.
        cache.clear()
        self.user = User.objects.create_user(
            email="member@example.com", password="Str0ng!Passw0rd"
        )

    def test_sixth_attempt_within_a_minute_is_throttled(self):
        for _ in range(5):
            response = self.client.post(
                self.url,
                {"email": self.user.email, "password": "wrong-password"},
                format="json",
            )
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        sixth = self.client.post(
            self.url,
            {"email": self.user.email, "password": "wrong-password"},
            format="json",
        )
        self.assertEqual(sixth.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    def test_correct_credentials_still_work_under_the_limit(self):
        response = self.client.post(
            self.url,
            {"email": self.user.email, "password": "Str0ng!Passw0rd"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)


class MeAndProfileTests(APITestCase):
    me_url = "/api/v1/auth/me/"
    profile_url = "/api/v1/auth/profile/"

    def setUp(self):
        self.member = User.objects.create_user(
            email="member@example.com", password="Str0ng!Passw0rd"
        )
        self.financial = User.objects.create_user(
            email="financial@example.com", password="Str0ng!Passw0rd", is_financial=True
        )

    def test_me_requires_authentication(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_reflects_role_flags(self):
        self.client.force_authenticate(self.financial)
        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.financial.email)
        self.assertFalse(response.data["is_admin"])
        self.assertTrue(response.data["is_financial"])
        self.assertIn("profile", response.data)

    def test_profile_update_persists_fields(self):
        self.client.force_authenticate(self.member)
        response = self.client.patch(
            self.profile_url,
            {"full_name": "Membro Exemplo", "bio": "Adora ler"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.member.profile.refresh_from_db()
        self.assertEqual(self.member.profile.full_name, "Membro Exemplo")
        self.assertEqual(self.member.profile.bio, "Adora ler")


class ChangePasswordTests(APITestCase):
    url = "/api/v1/auth/change-password/"

    def setUp(self):
        self.member = User.objects.create_user(
            email="member@example.com", password="Old!Passw0rd"
        )

    def test_wrong_old_password_rejected(self):
        self.client.force_authenticate(self.member)
        response = self.client.put(
            self.url,
            {"old_password": "not-the-password", "new_password": "Br4nd!NewPassw0rd"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.member.refresh_from_db()
        self.assertTrue(self.member.check_password("Old!Passw0rd"))

    def test_weak_new_password_rejected(self):
        self.client.force_authenticate(self.member)
        response = self.client.put(
            self.url,
            {"old_password": "Old!Passw0rd", "new_password": "1234567"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_correct_old_password_changes_it(self):
        self.client.force_authenticate(self.member)
        response = self.client.put(
            self.url,
            {"old_password": "Old!Passw0rd", "new_password": "Br4nd!NewPassw0rd"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.member.refresh_from_db()
        self.assertTrue(self.member.check_password("Br4nd!NewPassw0rd"))

    def test_requires_authentication(self):
        response = self.client.put(
            self.url,
            {"old_password": "Old!Passw0rd", "new_password": "Br4nd!NewPassw0rd"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ValidatePasswordViewTests(APITestCase):
    url = "/api/v1/auth/validate-password/"

    def setUp(self):
        self.member = User.objects.create_user(
            email="member@example.com", password="Str0ng!Passw0rd"
        )

    def test_valid_password_returns_true(self):
        self.client.force_authenticate(self.member)
        response = self.client.post(self.url, {"password": "Another!Str0ngPass"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["valid"])

    def test_weak_password_returns_errors(self):
        self.client.force_authenticate(self.member)
        response = self.client.post(self.url, {"password": "1234567"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("errors", response.data)


class MemberListViewTests(APITestCase):
    url = "/api/v1/auth/members/"

    def setUp(self):
        self.admin = User.objects.create_user(
            email="admin@example.com", password="Str0ng!Passw0rd", is_staff=True
        )
        self.member = User.objects.create_user(
            email="member@example.com", password="Str0ng!Passw0rd"
        )
        self.inactive = User.objects.create_user(
            email="inactive@example.com", password="Str0ng!Passw0rd", is_active=False
        )

    def test_admin_sees_only_active_members(self):
        self.client.force_authenticate(self.admin)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        emails = [m["email"] for m in response.data]
        self.assertIn(self.member.email, emails)
        self.assertNotIn(self.inactive.email, emails)

    def test_non_admin_forbidden(self):
        self.client.force_authenticate(self.member)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class InviteCodeViewSetTests(APITestCase):
    url = "/api/v1/auth/invite-codes/"

    def setUp(self):
        self.admin = User.objects.create_user(
            email="admin@example.com", password="Str0ng!Passw0rd", is_staff=True
        )
        self.member = User.objects.create_user(
            email="member@example.com", password="Str0ng!Passw0rd"
        )

    def test_admin_can_create_invite_code(self):
        self.client.force_authenticate(self.admin)
        response = self.client.post(
            self.url, {"code": "CLUBE2026", "max_uses": 5, "is_active": True}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(InviteCode.objects.filter(code="CLUBE2026").exists())

    def test_non_admin_cannot_create_invite_code(self):
        self.client.force_authenticate(self.member)
        response = self.client.post(
            self.url, {"code": "CLUBE2026", "max_uses": 5, "is_active": True}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_non_admin_cannot_list_invite_codes(self):
        InviteCode.objects.create(code="EXISTING", max_uses=1)

        self.client.force_authenticate(self.member)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
