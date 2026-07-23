from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Announcement, EmailLog, EmailStatus

User = get_user_model()


class AnnouncementRecipientSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="profile.full_name", default="")

    class Meta:
        model = User
        fields = ("id", "email", "full_name")


class AnnouncementSerializer(serializers.ModelSerializer):
    target_users = AnnouncementRecipientSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(
        source="created_by.profile.full_name", default="", read_only=True
    )
    recipient_count = serializers.SerializerMethodField()
    sent_count = serializers.SerializerMethodField()
    failed_count = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = (
            "id",
            "subject",
            "body_html",
            "created_by_name",
            "send_to_all",
            "target_users",
            "external_emails",
            "created_at",
            "sent_at",
            "recipient_count",
            "sent_count",
            "failed_count",
        )
        read_only_fields = ("created_at", "sent_at")

    def get_recipient_count(self, obj) -> int:
        return obj.email_logs.count()

    def get_sent_count(self, obj) -> int:
        return obj.email_logs.filter(status=EmailStatus.SENT).count()

    def get_failed_count(self, obj) -> int:
        return obj.email_logs.filter(status=EmailStatus.FAILED).count()


class AnnouncementCreateSerializer(serializers.ModelSerializer):
    target_user_ids = serializers.PrimaryKeyRelatedField(
        source="target_users",
        queryset=User.objects.filter(is_active=True),
        many=True,
        required=False,
        default=list,
    )
    external_emails = serializers.ListField(
        child=serializers.EmailField(), required=False, default=list
    )

    class Meta:
        model = Announcement
        fields = (
            "id",
            "subject",
            "body_html",
            "send_to_all",
            "target_user_ids",
            "external_emails",
        )

    def validate(self, attrs):
        send_to_all = attrs.get("send_to_all", False)
        target_users = attrs.get("target_users") or []
        external_emails = attrs.get("external_emails") or []

        if not send_to_all and not target_users and not external_emails:
            raise serializers.ValidationError(
                "Selecione ao menos um destinatário (membros ou emails externos)."
            )

        return attrs
