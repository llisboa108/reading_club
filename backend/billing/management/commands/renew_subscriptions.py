from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from api.emails import send_notification_email
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

            surcharge = sub.surcharge_amount
            amount = sub.effective_base_price + (surcharge or 0)
            notes = (
                f"Inclui acréscimo de R$ {surcharge}: {sub.surcharge_reason}".strip()
                if surcharge
                else ""
            )

            payment = Payment.objects.create(
                subscription=sub,
                amount=amount,
                due_date=sub.next_billing_date,
                notes=notes,
            )

            # Acréscimo pontual: some sozinho depois de ser cobrado uma vez.
            # custom_price não é limpo aqui - é permanente até o admin remover.
            if surcharge:
                sub.surcharge_amount = None
                sub.surcharge_reason = ""
                sub.save(update_fields=["surcharge_amount", "surcharge_reason"])

            Notification.objects.create(
                user=sub.user,
                type=NotificationType.PAYMENT,
                message=(
                    "A sua assinatura expira em 10 dias. "
                    "Um novo pagamento foi gerado."
                ),
                content_object=payment,
            )

            send_notification_email(
                subject="A sua assinatura expira em 10 dias",
                message=(
                    "Olá!\n\n"
                    "A sua assinatura do Clube Sonhos Literários expira em 10 dias. "
                    f"Um novo pagamento de R$ {amount} foi gerado, com vencimento "
                    f"em {sub.next_billing_date.strftime('%d/%m/%Y')}.\n\n"
                    "Aceda à sua conta para regularizar o pagamento."
                ),
                recipient=sub.user.email,
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
                content_object=sub,
            )

            send_notification_email(
                subject="A sua assinatura expirou",
                message=(
                    "Olá!\n\n"
                    "A sua assinatura do Clube Sonhos Literários expirou por falta de "
                    "pagamento. Aceda à sua conta e regularize o pagamento para "
                    "reativar o acesso."
                ),
                recipient=sub.user.email,
            )

            expired += 1

        self.stdout.write(
            self.style.WARNING(
                f"{expired} subscription(s) expired."
            )
        )
