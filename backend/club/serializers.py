from uuid import uuid4

import httpx
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile

from django.conf import settings

from .models import (
    Author,
    Publisher,
    Book,
    Reading,
    ReadingUser,
    Meet,
    MeetUser,
    MeetPhoto,
    Notification,
    BlogCategory,
    BlogPost,
    Quote,
    ContactMessage,
    TeamMember,
    TimelineEntry,
)

User = settings.AUTH_USER_MODEL

# Author serializer
class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ("id", "first_name", "last_name")


# Publisher serializer
class PublisherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publisher
        fields = ("id", "name")

# Book serializer
class BookSerializer(serializers.ModelSerializer):
    author = AuthorSerializer()
    publisher = PublisherSerializer()
    cover = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Book
        fields = (
            "id",
            "title",
            "subtitle",
            "isbn",
            "published_date",
            "pages",
            "author",
            "publisher",
            "cover",
        )


# Reading user serializer
class ReadingUserSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    class Meta:
        model = ReadingUser
        fields = ("user", "joined_at")

# Serilizer to show who suggested the reading
class MemberSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="profile.full_name", default="")

    class Meta:
        model = get_user_model()
        fields = ("id", "email", "full_name")

# Reading serializer
class ReadingSerializer(serializers.ModelSerializer):
    book = BookSerializer()
    participants = ReadingUserSerializer(
        source="readinguser_set",
        many=True,
        read_only=True
    )
    suggested_by = MemberSerializer(read_only=True)

    class Meta:
        model = Reading
        fields = (
            "id",
            "book",
            "suggested_by",
            "start_date",
            "end_date",
            "status",
            "participants",
        )


# Meet user serializer
class MeetUserSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    class Meta:
        model = MeetUser
        fields = ("user", "joined_at")

# Meet photo serializer
class MeetPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeetPhoto
        fields = ("id", "image")

# Meet serializer
class MeetSerializer(serializers.ModelSerializer):
    moderator = serializers.StringRelatedField()
    participants = MeetUserSerializer(
        source="meetuser_set",
        many=True,
        read_only=True
    )
    photos = MeetPhotoSerializer(many=True, read_only=True)

    class Meta:
        model = Meet
        fields = (
            "id",
            "reading",
            "moderator",
            "meet_date",
            "start_page",
            "end_page",
            "meet_type",
            "meeting_link",
            "address",
            "participants",
            "photos",
        )

# Noti serializer
class NotificationSerializer(serializers.ModelSerializer):
    # Exposes the related object (if any) as a model name + id pair so the
    # frontend can build a real deep link instead of only routing by `type`.
    target_type = serializers.SerializerMethodField()
    target_id = serializers.IntegerField(source="object_id", read_only=True)

    class Meta:
        model = Notification
        fields = (
            "id",
            "type",
            "message",
            "is_seen",
            "created_at",
            "target_type",
            "target_id",
        )

    def get_target_type(self, obj) -> str | None:
        return obj.content_type.model if obj.content_type_id else None

# Blog serializers
class BlogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = ("id", "name", "slug")

class BlogPostListSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()
    category = BlogCategorySerializer()
    image = serializers.ImageField()

    class Meta:
        model = BlogPost
        fields = (
            "id",
            "title",
            "slug",
            "author",
            "category",
            "image",
            "published_at",
        )

class BlogPostDetailSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()
    category = BlogCategorySerializer()
    image = serializers.ImageField()

    class Meta:
        model = BlogPost
        fields = (
            "id",
            "title",
            "slug",
            "author",
            "category",
            "content",
            "image",
            "published_at",
        )


# Write serializers

class BookWriteSerializer(serializers.ModelSerializer):
    subtitle = serializers.CharField(required=False, allow_blank=True, default="")
    isbn = serializers.CharField(required=False, allow_blank=True, default="")
    published_date = serializers.DateField(required=False, allow_null=True, default=None)
    cover = serializers.ImageField(required=False, allow_null=True, default=None)
    # Set by the ISBN lookup flow: a cover image URL to fetch and attach
    # server-side, as an alternative to uploading a `cover` file directly.
    cover_url = serializers.URLField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = Book
        fields = (
            "title",
            "subtitle",
            "isbn",
            "published_date",
            "pages",
            "author",
            "publisher",
            "cover",
            "cover_url",
        )

    def _attach_cover_from_url(self, instance, url):
        if not url:
            return
        try:
            response = httpx.get(url, timeout=10)
            response.raise_for_status()
        except httpx.HTTPError:
            # Best-effort: a failed cover download shouldn't block saving the book.
            return
        instance.cover.save(f"{uuid4().hex}.jpg", ContentFile(response.content), save=True)

    def create(self, validated_data):
        cover_url = validated_data.pop("cover_url", None)
        instance = super().create(validated_data)
        self._attach_cover_from_url(instance, cover_url)
        return instance

    def update(self, instance, validated_data):
        cover_url = validated_data.pop("cover_url", None)
        instance = super().update(instance, validated_data)
        self._attach_cover_from_url(instance, cover_url)
        return instance

# Reading write serializer
class ReadingWriteSerializer(serializers.ModelSerializer):
    users = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=get_user_model().objects.all(),
        required=False,
    )
    suggested_by = serializers.PrimaryKeyRelatedField(
        queryset=get_user_model().objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Reading
        fields = (
            "book",
            "suggested_by",
            "start_date",
            "end_date",
            "status",
            "users",
        )

    def _sync_users(self, instance, users):
        ReadingUser.objects.filter(reading=instance).delete()
        ReadingUser.objects.bulk_create([
            ReadingUser(reading=instance, user=u) for u in users
        ])

    def create(self, validated_data):
        users = validated_data.pop("users", [])
        reading = super().create(validated_data)
        self._sync_users(reading, users)
        return reading

    def update(self, instance, validated_data):
        users = validated_data.pop("users", None)
        instance = super().update(instance, validated_data)
        if users is not None:
            self._sync_users(instance, users)
        return instance

class MeetWriteSerializer(serializers.ModelSerializer):
    users = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=get_user_model().objects.all(),
        required=False,
    )

    class Meta:
        model = Meet
        fields = (
            "reading",
            "moderator",
            "meet_date",
            "start_page",
            "end_page",
            "meet_type",
            "meeting_link",
            "address",
            "users",
        )

    def _sync_users(self, instance, users):
        MeetUser.objects.filter(meet=instance).delete()
        MeetUser.objects.bulk_create([
            MeetUser(meet=instance, user=u) for u in users
        ])

    def create(self, validated_data):
        users = validated_data.pop("users", [])
        meet = super().create(validated_data)
        self._sync_users(meet, users)
        return meet

    def update(self, instance, validated_data):
        users = validated_data.pop("users", None)
        instance = super().update(instance, validated_data)
        if users is not None:
            self._sync_users(instance, users)
        return instance



class BlogPostWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = (
            "title",
            "slug",
            "content",
            "image",
            "category",
            "is_published",
            "published_at",
        )


# Public club stats (landing page counters)
class ClubStatsSerializer(serializers.Serializer):
    books_read = serializers.IntegerField()
    pages_read = serializers.IntegerField()
    reading_hours = serializers.IntegerField()
    meets_held = serializers.IntegerField()


# Landing page quotes carousel
class QuoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quote
        fields = ("id", "text", "attribution", "order", "is_active")


class QuoteWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quote
        fields = ("text", "attribution", "order", "is_active")


# Public contact/inquiry form
class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ("id", "name", "email", "message", "is_read", "created_at")
        read_only_fields = ("created_at",)


class ContactMessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ("name", "email", "message")


# Landing page team grid
class TeamMemberSerializer(serializers.ModelSerializer):
    image = serializers.ImageField()

    class Meta:
        model = TeamMember
        fields = ("id", "name", "role", "image", "instagram", "order", "is_active")


class TeamMemberWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = ("name", "role", "image", "instagram", "order", "is_active")


# Landing page history timeline
class TimelineEntrySerializer(serializers.ModelSerializer):
    image = serializers.ImageField()

    class Meta:
        model = TimelineEntry
        fields = ("id", "title", "date", "description", "image", "link", "order", "is_active")


class TimelineEntryWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimelineEntry
        fields = ("title", "date", "description", "image", "link", "order", "is_active")