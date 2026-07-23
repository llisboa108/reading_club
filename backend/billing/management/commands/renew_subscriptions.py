from django.contrib.contenttypes.models import ContentType
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from api.emails import send_template_email
from billing.models import (
    Subscription,
    SubscriptionStatus,
    Payment,
    PaymentStatus,
    PaymentMethod,
)
from club.models import Notification, NotificationType
from communications.models import EmailCategory


class Command(BaseCommand):
    help = "Generate advance charges, remind and expire unpaid subscriptions"

    def handle(self, *args, **options):
        today = timezone.now().date()
        advance_day = today + timedelta(days=10)
        due_soon_day = today + timedelta(days=3)

        self.generate_advance_payments(advance_day)
        self.remind_pending_payments(due_soon_day)
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

            send_template_email(
                "charge_generated",
                {
                    "amount": amount,
                    "due_date": sub.next_billing_date.strftime("%d/%m/%Y"),
                },
                subject="A sua assinatura expira em 10 dias",
                recipient=sub.user.email,
                category=EmailCategory.TRANSACTIONAL,
                user=sub.user,
            )

            created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"{created} advance payment(s) generated."
            )
        )

    def remind_pending_payments(self, due_soon_day):
        payments = Payment.objects.filter(
            status=PaymentStatus.PENDING,
            due_date=due_soon_day,
        ).select_related("subscription__user")

        payment_content_type = ContentType.objects.get_for_model(Payment)
        reminded = 0

        for payment in payments:
            # Idempotent: skip if already reminded for this exact payment.
            already_sent = Notification.objects.filter(
                user=payment.subscription.user,
                type=NotificationType.PAYMENT,
                content_type=payment_content_type,
                object_id=payment.id,
                message="A sua mensalidade vence em 3 dias.",
            ).exists()

            if already_sent:
                continue

            user = payment.subscription.user

            Notification.objects.create(
                user=user,
                type=NotificationType.PAYMENT,
                message="A sua mensalidade vence em 3 dias.",
                content_object=payment,
            )

            send_template_email(
                "payment_due_soon",
                {
                    "amount": payment.amount,
                    "due_date": payment.due_date.strftime("%d/%m/%Y"),
                },
                subject="A sua mensalidade vence em breve",
                recipient=user.email,
                category=EmailCategory.TRANSACTIONAL,
                user=user,
            )

            reminded += 1

        self.stdout.write(
            self.style.SUCCESS(f"{reminded} due-soon reminder(s) sent.")
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

            send_template_email(
                "subscription_expired",
                {},
                subject="A sua assinatura expirou",
                recipient=sub.user.email,
                category=EmailCategory.TRANSACTIONAL,
                user=sub.user,
            )

            expired += 1

        self.stdout.write(
            self.style.WARNING(
                f"{expired} subscription(s) expired."
            )
        )
