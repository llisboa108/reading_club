from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from billing.models import (
    Subscription,
    SubscriptionStatus,
    Payment,
    PaymentStatus,
    PaymentMethod,
)
from club.models import Notification, NotificationType


class Command(BaseCommand):
    help = "Generate advance charges, notify users and expire unpaid subscriptions"

    def handle(self, *args, **options):
        today = timezone.now().date()
        advance_day = today + timedelta(days=10)

        self.generate_advance_payments(advance_day)
        self.expire_unpaid_subscriptions(today)

    def generate_advance_payments(self, advance_day):
        subscriptions = Subscription.objects.filter(
            status=SubscriptionStatus.ACTIVE,
            next_billing_date=advance_day,
        )

        created = 0

        for sub in subscriptions:
            # Avoid duplicate pending payment
            exists = Payment.objects.filter(
                subscription=sub,
                status=PaymentStatus.PENDING,
                due_date=sub.next_billing_date,
            ).exists()

            if exists:
                continue

            Payment.objects.create(
                subscription=sub,
                amount=sub.plan.price,
                due_date=sub.next_billing_date,
            )

            Notification.objects.create(
                user=sub.user,
                type=NotificationType.PAYMENT,
                message=(
                    "A sua assinatura expira em 10 dias. "
                    "Um novo pagamento foi gerado."
                ),
            )

            created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"{created} advance payment(s) generated."
            )
        )

    def expire_unpaid_subscriptions(self, today):
        subscriptions = Subscription.objects.filter(
            status=SubscriptionStatus.ACTIVE,
            next_billing_date__lt=today,
        )

        expired = 0

        for sub in subscriptions:
            paid = Payment.objects.filter(
                subscription=sub,
                status=PaymentStatus.CONFIRMED,
                paid_at__date__gte=sub.next_billing_date - timedelta(days=40),
            ).exists()

            if paid:
                continue

            sub.status = SubscriptionStatus.EXPIRED
            sub.save(update_fields=["status"])

            Notification.objects.create(
                user=sub.user,
                type=NotificationType.PAYMENT,
                message=(
                    "A sua assinatura expirou por falta de pagamento."
                ),
            )

            expired += 1

        self.stdout.write(
            self.style.WARNING(
                f"{expired} subscription(s) expired."
            )
        )
