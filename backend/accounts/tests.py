from django.contrib.auth import get_user_model
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
