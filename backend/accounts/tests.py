import re

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core import mail
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
