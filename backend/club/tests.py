from unittest.mock import Mock, patch

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Author, Publisher, Book, Notification, NotificationType

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
