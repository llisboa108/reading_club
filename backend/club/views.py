from django.utils import timezone
from rest_framework.viewsets import ReadOnlyModelViewSet, ModelViewSet
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, extend_schema_view

from api.permissions import (
    IsAdmin,
    IsAdminOrReadOnly,
    IsMemberWithActiveSubscription,
    IsNotificationOwner,
)

from .isbn_lookup import (
    ISBNLookupError,
    ISBNNotFoundError,
    fetch_book_metadata,
    split_author_name,
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

    def get_permissions(self):
        if self.action == "lookup_isbn":
            # A GET that has side effects (get-or-create on Author/Publisher),
            # so it needs to be admin-only unlike the rest of this viewset.
            return [IsAuthenticated(), IsAdmin()]
        return super().get_permissions()

    @extend_schema(
        tags=["Club"],
        operation_id="booksLookupIsbn",
        summary="Look up book metadata by ISBN",
        description=(
            "Queries the Google Books API for the given ISBN and returns "
            "book metadata (title, author, publisher, cover, etc.) to "
            "pre-fill the create-book form. Get-or-creates the matching "
            "Author/Publisher by name so the frontend can select them "
            "immediately. Admin-only."
        ),
        responses={200: None},
    )
    @action(detail=False, methods=["get"], url_path="lookup-isbn")
    def lookup_isbn(self, request):
        isbn = request.query_params.get("isbn", "").strip().replace("-", "").replace(" ", "")
        if not isbn:
            return Response(
                {"detail": "Informe um ISBN."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            metadata = fetch_book_metadata(isbn)
        except ISBNNotFoundError:
            return Response(
                {"detail": "Nenhum livro encontrado para esse ISBN."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ISBNLookupError:
            return Response(
                {"detail": "Não foi possível consultar o serviço de busca por ISBN no momento."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        author = None
        if metadata["author_name"]:
            first_name, last_name = split_author_name(metadata["author_name"])
            author = Author.objects.filter(
                first_name__iexact=first_name, last_name__iexact=last_name
            ).first()
            if not author:
                author = Author.objects.create(first_name=first_name, last_name=last_name)

        publisher = None
        if metadata["publisher_name"]:
            publisher = Publisher.objects.filter(
                name__iexact=metadata["publisher_name"]
            ).first()
            if not publisher:
                publisher = Publisher.objects.create(name=metadata["publisher_name"])

        return Response({
            "isbn": isbn,
            "title": metadata["title"],
            "subtitle": metadata["subtitle"],
            "published_date": metadata["published_date"],
            "pages": metadata["pages"],
            "cover_url": metadata["cover_url"],
            "author": AuthorSerializer(author).data if author else None,
            "publisher": PublisherSerializer(publisher).data if publisher else None,
            "already_registered": Book.objects.filter(isbn=isbn).exists(),
        })

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