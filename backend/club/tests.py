from datetime import timedelta
from unittest.mock import Mock, patch

from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import (
    Author,
    Publisher,
    Book,
    Notification,
    NotificationType,
    Reading,
    ReadingStatus,
    Meet,
    MeetUser,
    MeetType,
    Quote,
    ContactMessage,
    TeamMember,
    TimelineEntry,
)

# Minimal valid 1x1 transparent GIF, used to exercise ImageField uploads
# without needing a real photo on disk.
TINY_GIF = (
    b"GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!\xf9\x04"
    b"\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;"
)


def make_test_image(name="test.gif"):
    return SimpleUploadedFile(name, TINY_GIF, content_type="image/gif")

User = get_user_model()


class NotificationMarkSeenTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email="owner@example.com", password="Str0ng!Passw0rd"
        )
        self.other = User.objects.create_user(
            email="other@example.com", password="Str0ng!Passw0rd"
        )
        self.notification = Notification.objects.create(
            user=self.owner,
            type=NotificationType.PAYMENT,
            message="Your payment has been confirmed.",
        )

    def _url(self, notification):
        return f"/api/v1/club/notifications/{notification.id}/mark-seen/"

    def test_owner_can_mark_notification_seen(self):
        self.client.force_authenticate(self.owner)
        response = self.client.patch(self._url(self.notification), format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notification.refresh_from_db()
        self.assertTrue(self.notification.is_seen)

    def test_non_owner_cannot_mark_notification_seen(self):
        self.client.force_authenticate(self.other)
        response = self.client.patch(self._url(self.notification), format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.notification.refresh_from_db()
        self.assertFalse(self.notification.is_seen)

OPEN_LIBRARY_SUCCESS_RESPONSE = {
    "ISBN:9780545139700": {
        "title": "Harry Potter and the Deathly Hallows",
        "authors": [{"name": "J.K. Rowling"}],
        "publishers": [{"name": "Scholastic"}],
        "publish_date": "2007",
        "number_of_pages": 759,
        "cover": {"large": "http://covers.openlibrary.org/b/id/cover.jpg"},
    }
}


def _mock_response(json_data, ok=True):
    response = Mock()
    response.json.return_value = json_data
    if ok:
        response.raise_for_status.return_value = None
    else:
        response.raise_for_status.side_effect = Exception("boom")
    return response


class ISBNLookupTests(APITestCase):
    url = "/api/v1/club/books/lookup-isbn/"

    def setUp(self):
        self.admin = User.objects.create_user(
            email="admin@example.com", password="Str0ng!Passw0rd", is_staff=True
        )
        self.member = User.objects.create_user(
            email="member@example.com", password="Str0ng!Passw0rd"
        )

    @patch("club.isbn_lookup.httpx.get")
    def test_lookup_creates_author_and_publisher(self, mock_get):
        mock_get.return_value = _mock_response(OPEN_LIBRARY_SUCCESS_RESPONSE)

        self.client.force_authenticate(self.admin)
        response = self.client.get(self.url, {"isbn": "9780545139700"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Harry Potter and the Deathly Hallows")
        self.assertEqual(response.data["pages"], 759)
        self.assertEqual(response.data["published_date"], "2007-01-01")
        self.assertFalse(response.data["already_registered"])

        author = Author.objects.get(first_name="J.K.", last_name="Rowling")
        self.assertEqual(response.data["author"]["id"], author.id)

        publisher = Publisher.objects.get(name="Scholastic")
        self.assertEqual(response.data["publisher"]["id"], publisher.id)

    @patch("club.isbn_lookup.httpx.get")
    def test_lookup_reuses_existing_author_case_insensitive(self, mock_get):
        Author.objects.create(first_name="j.k.", last_name="rowling")
        mock_get.return_value = _mock_response(OPEN_LIBRARY_SUCCESS_RESPONSE)

        self.client.force_authenticate(self.admin)
        self.client.get(self.url, {"isbn": "9780545139700"})

        self.assertEqual(Author.objects.count(), 1)

    @patch("club.isbn_lookup.httpx.get")
    def test_lookup_not_found_returns_404(self, mock_get):
        mock_get.return_value = _mock_response({})

        self.client.force_authenticate(self.admin)
        response = self.client.get(self.url, {"isbn": "0000000000"})

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_lookup_forbidden_for_non_admin(self):
        self.client.force_authenticate(self.member)
        response = self.client.get(self.url, {"isbn": "9780545139700"})

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @patch("club.isbn_lookup.httpx.get")
    def test_lookup_flags_already_registered_book(self, mock_get):
        author = Author.objects.create(first_name="J.K.", last_name="Rowling")
        publisher = Publisher.objects.create(name="Scholastic")
        Book.objects.create(
            title="Harry Potter and the Deathly Hallows",
            isbn="9780545139700",
            pages=759,
            author=author,
            publisher=publisher,
        )
        mock_get.return_value = _mock_response(OPEN_LIBRARY_SUCCESS_RESPONSE)

        self.client.force_authenticate(self.admin)
        response = self.client.get(self.url, {"isbn": "9780545139700"})

        self.assertTrue(response.data["already_registered"])


class PublicClubStatsTests(APITestCase):
    url = "/api/v1/club/public-stats/"

    def setUp(self):
        author = Author.objects.create(first_name="Jane", last_name="Austen")
        publisher = Publisher.objects.create(name="Editora Teste")

        finished_book = Book.objects.create(
            title="Orgulho e Preconceito",
            isbn="9780000000001",
            pages=300,
            author=author,
            publisher=publisher,
        )
        planned_book = Book.objects.create(
            title="Persuasão",
            isbn="9780000000002",
            pages=250,
            author=author,
            publisher=publisher,
        )

        self.finished_reading = Reading.objects.create(
            book=finished_book,
            start_date=timezone.now().date() - timedelta(days=60),
            end_date=timezone.now().date() - timedelta(days=30),
            status=ReadingStatus.FINISHED,
        )
        # A second finished reading of a book with the same page count as
        # the first, to make the pages_read sum unambiguous in assertions.
        self.other_finished_reading = Reading.objects.create(
            book=finished_book,
            start_date=timezone.now().date() - timedelta(days=120),
            end_date=timezone.now().date() - timedelta(days=90),
            status=ReadingStatus.FINISHED,
        )
        self.planned_reading = Reading.objects.create(
            book=planned_book,
            start_date=timezone.now().date() + timedelta(days=10),
            status=ReadingStatus.PLANNED,
        )

        Meet.objects.create(
            reading=self.finished_reading,
            meet_date=timezone.now() - timedelta(days=45),
            meet_type=MeetType.ONLINE,
        )
        Meet.objects.create(
            reading=self.planned_reading,
            meet_date=timezone.now() + timedelta(days=10),
            meet_type=MeetType.IN_PERSON,
        )

    def test_stats_only_count_finished_readings_and_past_meets(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["books_read"], 2)
        self.assertEqual(response.data["pages_read"], 600)
        self.assertEqual(response.data["reading_hours"], 20)  # 600 // 30
        self.assertEqual(response.data["meets_held"], 1)

    def test_stats_endpoint_does_not_require_authentication(self):
        # No force_authenticate call - the landing page calls this anonymously.
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class QuoteTests(APITestCase):
    url = "/api/v1/club/quotes/"

    def setUp(self):
        self.admin = User.objects.create_user(
            email="admin@example.com", password="Str0ng!Passw0rd", is_staff=True
        )
        self.member = User.objects.create_user(
            email="member@example.com", password="Str0ng!Passw0rd"
        )
        self.active_quote = Quote.objects.create(
            text="Ler é sonhar de olhos abertos.", attribution="Sonhos Literários", order=0
        )
        self.inactive_quote = Quote.objects.create(
            text="Rascunho ainda não publicado.", is_active=False, order=1
        )

    def test_public_list_only_returns_active_quotes_without_authentication(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        texts = [q["text"] for q in response.data["results"]] if "results" in response.data else [
            q["text"] for q in response.data
        ]
        self.assertIn(self.active_quote.text, texts)
        self.assertNotIn(self.inactive_quote.text, texts)

    def test_admin_list_includes_inactive_quotes(self):
        self.client.force_authenticate(self.admin)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        texts = [q["text"] for q in response.data["results"]] if "results" in response.data else [
            q["text"] for q in response.data
        ]
        self.assertIn(self.inactive_quote.text, texts)

    def test_non_admin_cannot_create_quote(self):
        self.client.force_authenticate(self.member)
        response = self.client.post(self.url, {"text": "Nova citação"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_cannot_create_quote(self):
        # No credentials attempted at all -> DRF reports 401, not 403 (see
        # APIView.permission_denied: 403 only once an authenticator has
        # actually run and failed, otherwise it's "not authenticated").
        response = self.client.post(self.url, {"text": "Nova citação"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_can_create_edit_and_delete_quote(self):
        self.client.force_authenticate(self.admin)

        create_response = self.client.post(
            self.url, {"text": "Uma nova citação", "order": 2}, format="json"
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        # QuoteWriteSerializer excludes "id" (mirrors PlanWriteSerializer),
        # so look the row up by its unique text instead of the response body.
        quote_id = Quote.objects.get(text="Uma nova citação").id

        edit_response = self.client.patch(
            f"{self.url}{quote_id}/", {"text": "Citação editada"}, format="json"
        )
        self.assertEqual(edit_response.status_code, status.HTTP_200_OK)
        self.assertEqual(edit_response.data["text"], "Citação editada")

        delete_response = self.client.delete(f"{self.url}{quote_id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Quote.objects.filter(id=quote_id).exists())


class ContactMessageTests(APITestCase):
    url = "/api/v1/club/contact-messages/"

    def setUp(self):
        self.admin = User.objects.create_user(
            email="admin@example.com", password="Str0ng!Passw0rd", is_staff=True
        )
        self.member = User.objects.create_user(
            email="member@example.com", password="Str0ng!Passw0rd"
        )

    def test_anonymous_can_submit_contact_message(self):
        response = self.client.post(
            self.url,
            {"name": "Visitante", "email": "visitante@example.com", "message": "Quero saber mais."},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ContactMessage.objects.count(), 1)
        saved = ContactMessage.objects.first()
        self.assertEqual(saved.name, "Visitante")
        self.assertFalse(saved.is_read)

    def test_submitting_contact_message_emails_the_club(self):
        mail.outbox = []
        self.client.post(
            self.url,
            {"name": "Visitante", "email": "visitante@example.com", "message": "Quero saber mais."},
            format="json",
        )

        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Visitante", mail.outbox[0].subject)

    def test_non_admin_cannot_list_contact_messages(self):
        ContactMessage.objects.create(
            name="Visitante", email="visitante@example.com", message="Oi"
        )
        self.client.force_authenticate(self.member)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_cannot_list_contact_messages(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_can_list_and_mark_message_as_read(self):
        message = ContactMessage.objects.create(
            name="Visitante", email="visitante@example.com", message="Oi"
        )
        self.client.force_authenticate(self.admin)

        list_response = self.client.get(self.url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)

        patch_response = self.client.patch(
            f"{self.url}{message.id}/", {"is_read": True}, format="json"
        )
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        message.refresh_from_db()
        self.assertTrue(message.is_read)


class TeamMemberTests(APITestCase):
    url = "/api/v1/club/team-members/"

    def setUp(self):
        self.admin = User.objects.create_user(
            email="admin@example.com", password="Str0ng!Passw0rd", is_staff=True
        )
        self.member = User.objects.create_user(
            email="member@example.com", password="Str0ng!Passw0rd"
        )
        self.active_member = TeamMember.objects.create(
            name="Membro Ativo", role="Membro desde 2020", image=make_test_image(), order=0
        )
        self.inactive_member = TeamMember.objects.create(
            name="Membro Inativo", image=make_test_image(), is_active=False, order=1
        )

    def _rows(self, response):
        return response.data["results"] if "results" in response.data else response.data

    def test_public_list_only_returns_active_members(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [m["name"] for m in self._rows(response)]
        self.assertIn(self.active_member.name, names)
        self.assertNotIn(self.inactive_member.name, names)

    def test_admin_list_includes_inactive_members(self):
        self.client.force_authenticate(self.admin)
        response = self.client.get(self.url)

        names = [m["name"] for m in self._rows(response)]
        self.assertIn(self.inactive_member.name, names)

    def test_non_admin_cannot_create_member(self):
        self.client.force_authenticate(self.member)
        response = self.client.post(
            self.url, {"name": "Novo Membro", "image": make_test_image()}, format="multipart"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create_edit_and_delete_member(self):
        self.client.force_authenticate(self.admin)

        create_response = self.client.post(
            self.url,
            {"name": "Novo Membro", "role": "Membro desde 2024", "image": make_test_image(), "order": 7},
            format="multipart",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        member_id = TeamMember.objects.get(name="Novo Membro").id

        edit_response = self.client.patch(
            f"{self.url}{member_id}/", {"role": "Papel editado"}, format="multipart"
        )
        self.assertEqual(edit_response.status_code, status.HTTP_200_OK)
        self.assertEqual(edit_response.data["role"], "Papel editado")

        delete_response = self.client.delete(f"{self.url}{member_id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(TeamMember.objects.filter(id=member_id).exists())


class TimelineEntryTests(APITestCase):
    url = "/api/v1/club/timeline-entries/"

    def setUp(self):
        self.admin = User.objects.create_user(
            email="admin@example.com", password="Str0ng!Passw0rd", is_staff=True
        )
        self.member = User.objects.create_user(
            email="member@example.com", password="Str0ng!Passw0rd"
        )
        self.active_entry = TimelineEntry.objects.create(
            title="Marco Ativo", date="2024", description="Descrição.", image=make_test_image(), order=0
        )
        self.inactive_entry = TimelineEntry.objects.create(
            title="Marco Inativo", date="2024", description="Descrição.",
            image=make_test_image(), is_active=False, order=1
        )

    def _rows(self, response):
        return response.data["results"] if "results" in response.data else response.data

    def test_public_list_only_returns_active_entries(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [e["title"] for e in self._rows(response)]
        self.assertIn(self.active_entry.title, titles)
        self.assertNotIn(self.inactive_entry.title, titles)

    def test_non_admin_cannot_create_entry(self):
        self.client.force_authenticate(self.member)
        response = self.client.post(
            self.url,
            {"title": "Novo Marco", "date": "2025", "description": "X", "image": make_test_image()},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create_edit_and_delete_entry(self):
        self.client.force_authenticate(self.admin)

        create_response = self.client.post(
            self.url,
            {"title": "Novo Marco", "date": "2025", "description": "Descrição do marco.",
             "image": make_test_image(), "order": 20},
            format="multipart",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        entry_id = TimelineEntry.objects.get(title="Novo Marco").id

        edit_response = self.client.patch(
            f"{self.url}{entry_id}/", {"description": "Descrição editada."}, format="multipart"
        )
        self.assertEqual(edit_response.status_code, status.HTTP_200_OK)
        self.assertEqual(edit_response.data["description"], "Descrição editada.")

        delete_response = self.client.delete(f"{self.url}{entry_id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(TimelineEntry.objects.filter(id=entry_id).exists())


class SendMeetRemindersCommandTests(TestCase):
    def setUp(self):
        author = Author.objects.create(first_name="Jane", last_name="Austen")
        publisher = Publisher.objects.create(name="Editora Teste")
        book = Book.objects.create(
            title="Emma", isbn="9780000000099", pages=400, author=author, publisher=publisher
        )
        self.reading = Reading.objects.create(
            book=book,
            start_date=timezone.now().date(),
            status=ReadingStatus.IN_PROGRESS,
        )
        self.participant = User.objects.create_user(
            email="participant@example.com", password="Str0ng!Passw0rd"
        )
        self.non_participant = User.objects.create_user(
            email="other@example.com", password="Str0ng!Passw0rd"
        )

    def _create_meet(self, meet_date, **kwargs):
        meet = Meet.objects.create(reading=self.reading, meet_date=meet_date, **kwargs)
        MeetUser.objects.create(meet=meet, user=self.participant)
        return meet

    def test_reminder_created_and_emailed_for_tomorrows_meet(self):
        tomorrow = timezone.now() + timedelta(days=1)
        meet = self._create_meet(tomorrow, meet_type=MeetType.ONLINE, meeting_link="https://meet.example/x")

        call_command("send_meet_reminders")

        notification = self.participant.notifications.get(type=NotificationType.MEET)
        meet_content_type = ContentType.objects.get_for_model(Meet)
        self.assertEqual(notification.content_type, meet_content_type)
        self.assertEqual(notification.object_id, meet.id)
        self.assertIn("Emma", notification.message)

        self.assertFalse(
            self.non_participant.notifications.filter(type=NotificationType.MEET).exists()
        )

        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.participant.email])

    def test_no_reminder_for_meet_further_out_than_tomorrow(self):
        next_week = timezone.now() + timedelta(days=7)
        self._create_meet(next_week)

        call_command("send_meet_reminders")

        self.assertFalse(
            self.participant.notifications.filter(type=NotificationType.MEET).exists()
        )
        self.assertEqual(len(mail.outbox), 0)

    def test_reminder_is_not_duplicated_on_second_run(self):
        tomorrow = timezone.now() + timedelta(days=1)
        self._create_meet(tomorrow)

        call_command("send_meet_reminders")
        call_command("send_meet_reminders")

        self.assertEqual(
            self.participant.notifications.filter(type=NotificationType.MEET).count(), 1
        )
        self.assertEqual(len(mail.outbox), 1)
