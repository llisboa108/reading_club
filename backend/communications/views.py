from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.mixins import CreateModelMixin, ListModelMixin, RetrieveModelMixin
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import GenericViewSet
from drf_spectacular.utils import extend_schema_view, extend_schema

from api.emails import send_template_email
from api.permissions import IsAdmin
from club.models import Notification, NotificationType

from .models import Announcement, EmailCategory
from .serializers import AnnouncementSerializer, AnnouncementCreateSerializer

User = get_user_model()


@extend_schema_view(
    list=extend_schema(tags=["Communications"]),
    retrieve=extend_schema(tags=["Communications"]),
    create=extend_schema(tags=["Communications"]),
)
class AnnouncementViewSet(
    ListModelMixin, RetrieveModelMixin, CreateModelMixin, GenericViewSet
):
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Announcement.objects.all().order_by("-created_at").prefetch_related(
        "target_users__profile"
    )

    def get_serializer_class(self):
        if self.action == "create":
            return AnnouncementCreateSerializer
        return AnnouncementSerializer

    def perform_create(self, serializer):
        announcement = serializer.save(created_by=self.request.user)

        if announcement.send_to_all:
            recipients = list(User.objects.filter(is_active=True))
        else:
            recipients = list(announcement.target_users.all())

        for member in recipients:
            send_template_email(
                "announcement",
                {"subject": announcement.subject, "body_html": announcement.body_html},
                subject=announcement.subject,
                recipient=member.email,
                category=EmailCategory.BROADCAST,
                user=member,
                announcement=announcement,
            )
            Notification.objects.create(
                user=member,
                type=NotificationType.SYSTEM,
                message=announcement.subject,
                content_object=announcement,
            )

        for email in announcement.external_emails:
            send_template_email(
                "announcement",
                {"subject": announcement.subject, "body_html": announcement.body_html},
                subject=announcement.subject,
                recipient=email,
                category=EmailCategory.BROADCAST,
                announcement=announcement,
            )

        announcement.sent_at = timezone.now()
        announcement.save(update_fields=["sent_at"])
