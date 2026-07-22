import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def send_notification_email(subject, message, recipient):
    """Send a plain-text email, logging (not raising) on failure.

    Used by scheduled commands (renew_subscriptions, send_meet_reminders)
    where one bad address or a transient SMTP error shouldn't stop the
    rest of the batch from being processed.
    """
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
        )
        return True
    except Exception:
        logger.exception("Failed to send email to %s: %s", recipient, subject)
        return False
