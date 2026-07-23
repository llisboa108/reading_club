from django.contrib.auth import get_user_model
from django.db.models import Sum
from django.utils import timezone
from rest_framework.views import APIView
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
    ReadingStatus,
    Meet,
    Notification,
    NotificationType,
    BlogCategory,
    BlogPost,
    Quote,
    ContactMessage,
    TeamMember,
    TimelineEntry,
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
    ClubStatsSerializer,
    QuoteSerializer,
    QuoteWriteSerializer,
    ContactMessageSerializer,
    ContactMessageCreateSerializer,
    TeamMemberSerializer,
    TeamMemberWriteSerializer,
    TimelineEntrySerializer,
    TimelineEntryWriteSerializer,
)
from api.throttling import ContactMessageRateThrottle
from api.emails import send_notification_email
from django.conf import settings

# No Meet.duration field exists yet, so "reading hours" is estimated from
# pages actually read at a typical book-club reading pace rather than
# tracked directly - see PublicClubStatsView.
READING_PAGES_PER_HOUR = 30

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

    @extend_schema(
        tags=["Club"],
        operation_id="notificationsMarkSeen",
        summary="Mark a notification as seen",
        request=None,
        responses={200: NotificationSerializer},
    )
    @action(detail=True, methods=["patch"], url_path="mark-seen")
    def mark_seen(self, request, pk=None):
        notification = self.get_object()
        notification.is_seen = True
        notification.save(update_fields=["is_seen"])
        return Response(NotificationSerializer(notification).data)

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


# Public club stats (landing page counters)
class PublicClubStatsView(APIView):

    permission_classes = [AllowAny]

    @extend_schema(
        tags=["Club"],
        operation_id="clubPublicStats",
        summary="Public club stats for the landing page",
        responses={200: ClubStatsSerializer},
    )
    def get(self, request):
        finished_readings = Reading.objects.filter(status=ReadingStatus.FINISHED)

        pages_read = (
            finished_readings.aggregate(total=Sum("book__pages"))["total"] or 0
        )

        data = {
            "books_read": finished_readings.count(),
            "pages_read": pages_read,
            "reading_hours": pages_read // READING_PAGES_PER_HOUR,
            "meets_held": Meet.objects.filter(meet_date__lte=timezone.now()).count(),
        }

        return Response(ClubStatsSerializer(data).data)


# Landing page quotes carousel — admin manages via the React panel, public
# landing page reads only the active ones (same admin-writes/public-reads
# split as PublicBlogPostViewSet above).
@extend_schema_view(
    list=extend_schema(tags=["Club"]),
    retrieve=extend_schema(tags=["Club"]),
    create=extend_schema(tags=["Club"]),
    update=extend_schema(tags=["Club"]),
    partial_update=extend_schema(tags=["Club"]),
    destroy=extend_schema(tags=["Club"]),
)
class QuoteViewSet(ModelViewSet):
    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return Quote.objects.all()
        return Quote.objects.filter(is_active=True)

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdmin()]
        return [AllowAny()]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return QuoteWriteSerializer
        return QuoteSerializer


# Public contact/inquiry form (landing page) — anyone can submit, only
# admins can list/read/mark-as-read/delete via the React panel.
@extend_schema_view(
    list=extend_schema(tags=["Club"]),
    retrieve=extend_schema(tags=["Club"]),
    create=extend_schema(tags=["Club"]),
    update=extend_schema(tags=["Club"]),
    partial_update=extend_schema(tags=["Club"]),
    destroy=extend_schema(tags=["Club"]),
)
class ContactMessageViewSet(ModelViewSet):
    queryset = ContactMessage.objects.all()
    # AnonRateThrottle only throttles unauthenticated requests, so this only
    # ever affects the public `create` action, never the admin-only actions.
    throttle_classes = [ContactMessageRateThrottle]

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        return [IsAdmin()]

    def get_serializer_class(self):
        if self.action == "create":
            return ContactMessageCreateSerializer
        return ContactMessageSerializer

    def perform_create(self, serializer):
        message = serializer.save()
        send_notification_email(
            subject=f"Nova mensagem de contato de {message.name}",
            message=(
                f"Nome: {message.name}\n"
                f"E-mail: {message.email}\n\n"
                f"{message.message}"
            ),
            recipient=settings.CLUB_CONTACT_EMAIL,
        )

        User = get_user_model()
        for admin in User.objects.filter(is_staff=True, is_active=True):
            Notification.objects.create(
                user=admin,
                type=NotificationType.SYSTEM,
                message=f"Nova mensagem de contato de {message.name}",
                content_object=message,
            )


# Landing page team grid — admin manages (with photo upload) via the React
# panel, public landing page reads only the active ones.
@extend_schema_view(
    list=extend_schema(tags=["Club"]),
    retrieve=extend_schema(tags=["Club"]),
    create=extend_schema(tags=["Club"]),
    update=extend_schema(tags=["Club"]),
    partial_update=extend_schema(tags=["Club"]),
    destroy=extend_schema(tags=["Club"]),
)
class TeamMemberViewSet(ModelViewSet):
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return TeamMember.objects.all()
        return TeamMember.objects.filter(is_active=True)

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdmin()]
        return [AllowAny()]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return TeamMemberWriteSerializer
        return TeamMemberSerializer


# Landing page history timeline — same admin-writes/public-reads split, also
# with photo upload.
@extend_schema_view(
    list=extend_schema(tags=["Club"]),
    retrieve=extend_schema(tags=["Club"]),
    create=extend_schema(tags=["Club"]),
    update=extend_schema(tags=["Club"]),
    partial_update=extend_schema(tags=["Club"]),
    destroy=extend_schema(tags=["Club"]),
)
class TimelineEntryViewSet(ModelViewSet):
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return TimelineEntry.objects.all()
        return TimelineEntry.objects.filter(is_active=True)

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdmin()]
        return [AllowAny()]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return TimelineEntryWriteSerializer
        return TimelineEntrySerializer