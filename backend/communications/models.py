from django.conf import settings
from django.db import models

User = settings.AUTH_USER_MODEL


class Announcement(models.Model):
    subject = models.CharField(max_length=255)
    body_html = models.TextField()

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="announcements_sent",
    )

    send_to_all = models.BooleanField(default=False)
    target_users = models.ManyToManyField(
        User,
        blank=True,
        related_name="announcements_received",
        help_text="Ignorado quando send_to_all é True.",
    )
    external_emails = models.JSONField(
        default=list,
        blank=True,
        help_text="Endereços de email avulsos, fora do sistema.",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.subject


class EmailCategory(models.TextChoices):
    TRANSACTIONAL = "TRANSACTIONAL", "Transacional"
    BROADCAST = "BROADCAST", "Comunicado"
    CONTACT = "CONTACT", "Contato"


class EmailStatus(models.TextChoices):
    SENT = "SENT", "Enviado"
    FAILED = "FAILED", "Falhou"


class EmailLog(models.Model):
    recipient_email = models.EmailField()
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="email_logs",
    )

    subject = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=EmailCategory.choices)
    status = models.CharField(max_length=10, choices=EmailStatus.choices)
    error_message = models.TextField(blank=True, default="")

    announcement = models.ForeignKey(
        Announcement,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="email_logs",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.recipient_email} - {self.subject} ({self.status})"
