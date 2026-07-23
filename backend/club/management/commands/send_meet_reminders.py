from datetime import timedelta

from django.contrib.contenttypes.models import ContentType
from django.core.management.base import BaseCommand
from django.utils import timezone

from api.emails import send_template_email
from club.models import Meet, Notification, NotificationType
from communications.models import EmailCategory


class Command(BaseCommand):
    help = "Notify participants (in-app + email) of meets happening tomorrow"

    def handle(self, *args, **options):
        today = timezone.localdate()
        tomorrow = today + timedelta(days=1)

        meets = (
            Meet.objects.filter(meet_date__date=tomorrow)
            .select_related("reading__book")
            .prefetch_related("users")
        )

        meet_content_type = ContentType.objects.get_for_model(Meet)
        notified = 0

        for meet in meets:
            when = timezone.localtime(meet.meet_date).strftime("%d/%m/%Y às %H:%M")
            book_title = meet.reading.book.title

            for participant in meet.users.all():
                # Avoid re-notifying if the command runs more than once on
                # the same day for the same meet.
                already_sent = Notification.objects.filter(
                    user=participant,
                    type=NotificationType.MEET,
                    content_type=meet_content_type,
                    object_id=meet.id,
                ).exists()

                if already_sent:
                    continue

                message = f"Lembrete: encontro sobre \"{book_title}\" amanhã, {when}."

                Notification.objects.create(
                    user=participant,
                    type=NotificationType.MEET,
                    message=message,
                    content_object=meet,
                )

                send_template_email(
                    "meet_reminder",
                    {
                        "book_title": book_title,
                        "when": when,
                        "link": meet.meeting_link if meet.meet_type == "ONLINE" else None,
                        "address": meet.address if meet.meet_type != "ONLINE" else None,
                    },
                    subject=f"Lembrete: encontro amanhã - {book_title}",
                    recipient=participant.email,
                    category=EmailCategory.TRANSACTIONAL,
                    user=participant,
                )

                notified += 1

        self.stdout.write(
            self.style.SUCCESS(f"{notified} meet reminder(s) sent.")
        )
