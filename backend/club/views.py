from django.utils import timezone
from rest_framework.viewsets import ReadOnlyModelViewSet, ModelViewSet
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from drf_spectacular.utils import extend_schema, extend_schema_view

from api.permissions import (
    IsAdmin,
    IsAdminOrReadOnly,
    IsMemberWithActiveSubscription,
    IsNotificationOwner,
)

from .models import (
    Author,
    Publisher,
    Book,
    Reading,
    Meet,
    Notification,
    BlogCategory,
    BlogPost,
)

from .serializers import (
    AuthorSerializer,
    PublisherSerializer,
    BookSerializer,
    ReadingSerializer,
    MeetSerializer,
    NotificationSerializer,
    BlogCategorySerializer,
    BlogPostListSerializer,
    BlogPostWriteSerializer,
    BlogPostDetailSerializer,
    BookWriteSerializer,
    ReadingWriteSerializer,
    MeetWriteSerializer,
)

@extend_schema(tags=["Club"])

# Author
@extend_schema_view(
    list=extend_schema(tags=["Club"]),
    retrieve=extend_schema(tags=["Club"]),
    create=extend_schema(tags=["Club"]),
    update=extend_schema(tags=["Club"]),
    partial_update=extend_schema(tags=["Club"]),
    destroy=extend_schema(tags=["Club"]),
)
class AuthorViewSet(ModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [IsAdminOrReadOnly]

# Publisher
@extend_schema_view(
    list=extend_schema(tags=["Club"]),
    retrieve=extend_schema(tags=["Club"]),
    create=extend_schema(tags=["Club"]),
    update=extend_schema(tags=["Club"]),
    partial_update=extend_schema(tags=["Club"]),
    destroy=extend_schema(tags=["Club"]),
)
class PublisherViewSet(ModelViewSet):
    queryset = Publisher.objects.all()
    serializer_class = PublisherSerializer
    permission_classes = [IsAdminOrReadOnly]


# Books
@extend_schema_view(
    list=extend_schema(tags=["Club"]),
    retrieve=extend_schema(tags=["Club"]),
    create=extend_schema(tags=["Club"]),
    update=extend_schema(tags=["Club"]),
    partial_update=extend_schema(tags=["Club"]),
    destroy=extend_schema(tags=["Club"]),
)
class BookViewSet(ModelViewSet):
    queryset = Book.objects.select_related("author", "publisher")
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return BookWriteSerializer
        return BookSerializer

# Readings
@extend_schema_view(
    list=extend_schema(tags=["Club"]),
    retrieve=extend_schema(tags=["Club"]),
    create=extend_schema(tags=["Club"]),
    update=extend_schema(tags=["Club"]),
    partial_update=extend_schema(tags=["Club"]),
    destroy=extend_schema(tags=["Club"]),
)
class ReadingViewSet(ModelViewSet):
    def get_queryset(self):
        return (
            Reading.objects
            .select_related("book")
            .prefetch_related("readinguser_set__user")
        )

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdmin()]
        return [IsMemberWithActiveSubscription()]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ReadingWriteSerializer
        return ReadingSerializer

# Meets
@extend_schema_view(
    list=extend_schema(tags=["Club"]),
    retrieve=extend_schema(tags=["Club"]),
    create=extend_schema(tags=["Club"]),
    update=extend_schema(tags=["Club"]),
    partial_update=extend_schema(tags=["Club"]),
    destroy=extend_schema(tags=["Club"]),
)
class MeetViewSet(ModelViewSet):
    def get_queryset(self):
        return (
            Meet.objects
            .select_related("reading", "moderator")
            .prefetch_related(
                "meetuser_set__user",
                "photos"
            )
        )

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdmin()]
        return [IsMemberWithActiveSubscription()]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return MeetWriteSerializer
        return MeetSerializer

# Notifications
class NotificationViewSet(ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated, IsNotificationOwner]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).order_by("-created_at")

# Blog
@extend_schema_view(
    list=extend_schema(tags=["Club"]),
    retrieve=extend_schema(tags=["Club"]),
    create=extend_schema(tags=["Club"]),
    update=extend_schema(tags=["Club"]),
    partial_update=extend_schema(tags=["Club"]),
    destroy=extend_schema(tags=["Club"]),
)
class PublicBlogPostViewSet(ModelViewSet):
    lookup_field = "slug"
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return (
            BlogPost.objects
            .filter(
                is_published=True,
                published_at__lte=timezone.now()
            )
            .select_related("author", "category")
            .order_by("-published_at")
        )

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdmin()]
        return [AllowAny()]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return BlogPostWriteSerializer

        if self.action == "retrieve":
            return BlogPostDetailSerializer

        return BlogPostListSerializer

    def perform_create(self, serializer):
        serializer.save(
            author=self.request.user,
            published_at=timezone.now() if serializer.validated_data.get("is_published") else None
        )


# Blog categories
@extend_schema_view(
    list=extend_schema(tags=["Club"]),
    retrieve=extend_schema(tags=["Club"]),
    create=extend_schema(tags=["Club"]),
    update=extend_schema(tags=["Club"]),
    partial_update=extend_schema(tags=["Club"]),
    destroy=extend_schema(tags=["Club"]),
)
class BlogCategoryViewSet(ReadOnlyModelViewSet):
    queryset = BlogCategory.objects.all()
    serializer_class = BlogCategorySerializer
    permission_classes = [AllowAny]