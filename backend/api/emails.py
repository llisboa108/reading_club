import html
import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives, send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


def send_notification_email(subject, message, recipient):
    """Send a plain-text email, logging (not raising) on failure.

    Used for internal, non-branded notifications (e.g. the admin contact-form
    alert) where one bad address or a transient SMTP error shouldn't stop the
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


def send_template_email(template_name, context, subject, recipient, *, category, user=None, announcement=None):
    """Render a branded HTML email (emails/{template_name}.html) and send it,
    logging every attempt to communications.EmailLog and never raising - so a
    bad address or transient SMTP error never stops the rest of a batch send.
    """
    from communications.models import EmailLog, EmailStatus

    context = {**context, "contact_email": settings.CLUB_CONTACT_EMAIL, "frontend_url": settings.FRONTEND_URL}
    html_body = render_to_string(f"emails/{template_name}.html", context)
    # strip_tags leaves HTML entities (e.g. "&amp;" from an escaped "&" in a
    # query-string link) in place - unescape them so the plain-text
    # alternative reads (and parses) correctly.
    text_body = html.unescape(strip_tags(html_body))

    try:
        message = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient],
            reply_to=[settings.CLUB_CONTACT_EMAIL],
        )
        message.attach_alternative(html_body, "text/html")
        message.send()
        status = EmailStatus.SENT
        error_message = ""
    except Exception as exc:
        logger.exception("Failed to send templated email to %s: %s", recipient, subject)
        status = EmailStatus.FAILED
        error_message = str(exc)

    EmailLog.objects.create(
        recipient_email=recipient,
        user=user,
        subject=subject,
        category=category,
        status=status,
        error_message=error_message,
        announcement=announcement,
    )

    return status == EmailStatus.SENT
