from django.contrib import admin

from .models import Announcement, EmailLog


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ("subject", "created_by", "send_to_all", "created_at", "sent_at")
    list_filter = ("send_to_all",)
    search_fields = ("subject",)
    date_hierarchy = "created_at"
    readonly_fields = ("created_at", "sent_at")


@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    list_display = ("recipient_email", "subject", "category", "status", "created_at")
    list_filter = ("category", "status")
    search_fields = ("recipient_email", "subject")
    date_hierarchy = "created_at"
    readonly_fields = (
        "recipient_email", "user", "subject", "category", "status",
        "error_message", "announcement", "created_at",
    )
