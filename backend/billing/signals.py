from dateutil.relativedelta import relativedelta
from django.contrib.auth import get_user_model
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.utils import timezone

from billing.models import (
    Plan,
    Payment,
    PaymentStatus,
    Subscription,
    SubscriptionStatus,
)
from api.emails import send_template_email
from club.models import Notification, NotificationType
from communications.models import EmailCategory

User = get_user_model()


# Store previous status before saving.
@receiver(pre_save, sender=Payment)
def store_previous_payment_status(sender, instance: Payment, **kwargs):
    if instance.pk:
        try:
            instance._previous_status = Payment.objects.get(
                pk=instance.pk
            ).status
        except Payment.DoesNotExist:
            instance._previous_status = None
    else:
        instance._previous_status = None


# Handle subscription update ONLY when payment transitions to CONFIRMED.
@receiver(post_save, sender=Payment)
def handle_payment_confirmation(sender, instance: Payment, created, **kwargs):

    # Ignore creation
    if created:
        return

    # Only react to transition TO CONFIRMED
    if instance._previous_status == PaymentStatus.CONFIRMED:
        return

    if instance.status != PaymentStatus.CONFIRMED:
        return

    subscription = instance.subscription
    today = timezone.now().date()

    # Ensure paid_at is set
    if instance.paid_at is None:
        Payment.objects.filter(pk=instance.pk).update(
            paid_at=timezone.now()
        )

    # Determine subscription start
    if subscription.end_date and subscription.end_date >= today:
        start_date = subscription.end_date
    else:
        start_date = today
        subscription.start_date = today

    # Monthly renewal
    new_end_date = start_date + relativedelta(months=1)

    subscription.status = SubscriptionStatus.ACTIVE
    subscription.end_date = new_end_date
    subscription.next_billing_date = new_end_date

    subscription.save(
        update_fields=[
            "start_date",
            "end_date",
            "next_billing_date",
            "status",
        ]
    )

    # Create notification
    Notification.objects.create(
        user=subscription.user,
        type=NotificationType.PAYMENT,
        message="O seu pagamento foi confirmado. A sua assinatura está ativa.",
        content_object=instance,
    )

    send_template_email(
        "payment_confirmed",
        {"amount": instance.amount, "end_date": new_end_date.strftime("%d/%m/%Y")},
        subject="Pagamento confirmado",
        recipient=subscription.user.email,
        category=EmailCategory.TRANSACTIONAL,
        user=subscription.user,
    )

# Create subscription for new user
@receiver(post_save, sender=User)
def create_subscription_for_new_user(sender, instance, created, **kwargs):
    if not created:
        return

    # Do not create subscription for admins
    if instance.is_staff or instance.is_superuser:
        return

    plan = (
        Plan.objects
        .filter(is_active=True, is_default=True)
        .first()
    )

    if not plan:
        return  # no default plan configured

    today = timezone.now().date()

    Subscription.objects.create(
        user=instance,
        plan=plan,
        status=SubscriptionStatus.PENDING,
        start_date=today,
        end_date=today + relativedelta(months=1),
        next_billing_date=today + relativedelta(months=1),
    )

