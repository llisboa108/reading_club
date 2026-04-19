from rest_framework import serializers
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

# Reading serializer
class ReadingSerializer(serializers.ModelSerializer):
    book = BookSerializer()
    participants = ReadingUserSerializer(
        source="readinguser_set",
        many=True,
        read_only=True
    )

    class Meta:
        model = Reading
        fields = (
            "id",
            "book",
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
    class Meta:
        model = Notification
        fields = (
            "id",
            "type",
            "message",
            "is_seen",
            "created_at",
        )

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
    # ── CORRIGIDO: campos opcionais explicitamente nullable/blank ─────────────
    subtitle = serializers.CharField(required=False, allow_blank=True, default="")
    isbn = serializers.CharField(required=False, allow_blank=True, default="")
    published_date = serializers.DateField(required=False, allow_null=True, default=None)
    cover = serializers.ImageField(required=False, allow_null=True, default=None)

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
        )


class ReadingWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reading
        fields = (
            "book",
            "start_date",
            "end_date",
            "status",
        )


class MeetWriteSerializer(serializers.ModelSerializer):
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
        )


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