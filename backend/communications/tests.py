from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core import mail
from rest_framework import status
from rest_framework.test import APITestCase

from club.models import Notification
from .models import Announcement, EmailLog, EmailStatus

User = get_user_model()


class AnnouncementViewSetTests(APITestCase):
    url = "/api/v1/communications/announcements/"

    def setUp(self):
        self.admin = User.objects.create_user(
            email="admin@example.com", password="Str0ng!Passw0rd", is_staff=True
        )
        self.member_a = User.objects.create_user(
            email="a@example.com", password="Str0ng!Passw0rd"
        )
        self.member_b = User.objects.create_user(
            email="b@example.com", password="Str0ng!Passw0rd"
        )

    def test_non_admin_cannot_send_announcement(self):
        self.client.force_authenticate(self.member_a)

        response = self.client.post(
            self.url,
            {"subject": "Oi", "body_html": "<p>Oi</p>", "send_to_all": True},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(len(mail.outbox), 0)

    def test_send_to_all_emails_every_active_member(self):
        self.client.force_authenticate(self.admin)

        response = self.client.post(
            self.url,
            {"subject": "Aviso geral", "body_html": "<p>Conteudo</p>", "send_to_all": True},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # admin + member_a + member_b are all active users.
        self.assertEqual(len(mail.outbox), 3)

        announcement = Announcement.objects.get()
        self.assertIsNotNone(announcement.sent_at)
        self.assertEqual(
            EmailLog.objects.filter(announcement=announcement, status=EmailStatus.SENT).count(),
            3,
        )
        self.assertEqual(
            Notification.objects.filter(message="Aviso geral").count(), 3
        )

    def test_send_to_selected_members_and_external_emails(self):
        self.client.force_authenticate(self.admin)

        response = self.client.post(
            self.url,
            {
                "subject": "Só para vocês",
                "body_html": "<p>Conteudo</p>",
                "send_to_all": False,
                "target_user_ids": [self.member_a.id],
                "external_emails": ["fora@example.com"],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(mail.outbox), 2)
        recipients = {m.to[0] for m in mail.outbox}
        self.assertEqual(recipients, {self.member_a.email, "fora@example.com"})

        # Only the in-system member gets an in-app notification.
        self.assertEqual(Notification.objects.filter(message="Só para vocês").count(), 1)

    def test_no_recipients_returns_validation_error(self):
        self.client.force_authenticate(self.admin)

        response = self.client.post(
            self.url,
            {"subject": "Vazio", "body_html": "<p>x</p>", "send_to_all": False},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(len(mail.outbox), 0)

    @patch("api.emails.EmailMultiAlternatives.send", side_effect=[None, Exception("boom")])
    def test_partial_send_failure_does_not_abort_batch(self, mock_send):
        self.client.force_authenticate(self.admin)

        response = self.client.post(
            self.url,
            {
                "subject": "Parcial",
                "body_html": "<p>x</p>",
                "send_to_all": False,
                "target_user_ids": [self.member_a.id, self.member_b.id],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        announcement = Announcement.objects.get()
        self.assertEqual(
            EmailLog.objects.filter(announcement=announcement, status=EmailStatus.SENT).count(), 1
        )
        self.assertEqual(
            EmailLog.objects.filter(announcement=announcement, status=EmailStatus.FAILED).count(), 1
        )
        self.assertIsNotNone(announcement.sent_at)
