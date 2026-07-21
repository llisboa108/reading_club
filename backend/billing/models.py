from django.conf import settings
from django.db import models
from django.utils import timezone

User = settings.AUTH_USER_MODEL



# Plan models
class Plan(models.Model):
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=255, blank=True)

    price = models.DecimalField(max_digits=8, decimal_places=2)

    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(
        default=False,
        help_text="Default plan for new users"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# Subscriptions models
class SubscriptionStatus(models.TextChoices):
    PENDING = "PENDING", "Pendente"
    ACTIVE = "ACTIVE", "Ativa"
    EXPIRED = "EXPIRED", "Expirada"
    CANCELED = "CANCELED", "Cancelada"


class Subscription(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="subscriptions"
    )

    plan = models.ForeignKey(
        Plan,
        on_delete=models.PROTECT,
        related_name="subscriptions"
    )

    status = models.CharField(
        max_length=20,
        choices=SubscriptionStatus.choices,
        default=SubscriptionStatus.PENDING
    )

    start_date = models.DateField()
    end_date = models.DateField()
    next_billing_date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.plan}"

# Payment models
class PaymentMethod(models.TextChoices):
    PIX = "PIX", "PIX"
    CASH = "CASH", "Dinheiro"
    MERCADOPAGO = "MP", "Mercado Pago"

class PaymentStatus(models.TextChoices):
    PENDING = "PENDING", "Pendente"
    CONFIRMED = "CONFIRMED", "Confirmado"
    CANCELED = "CANCELED", "Cancelado"
    FAILED = "FAILED", "Falhou"

class Payment(models.Model):
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.CASCADE,
        related_name="payments"
    )

    amount = models.DecimalField(
        max_digits=8,
        decimal_places=2
    )

    method = models.CharField(
        max_length=10,
        choices=PaymentMethod.choices,
        default=PaymentMethod.MERCADOPAGO
    )

    status = models.CharField(
        max_length=10,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING
    )

    issued_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField()
    paid_at = models.DateTimeField(blank=True, null=True)

    external_id = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    receipt = models.FileField(
        upload_to="receipts/",
        blank=True,
        null=True
    )

    confirmed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="confirmed_payments"
    )

    notes = models.TextField(blank=True)

    def confirm(self, user=None):
        self.status = PaymentStatus.CONFIRMED
        self.paid_at = timezone.now()
        if user:
            self.confirmed_by = user
        self.save()

    def __str__(self):
        return f"{self.subscription.user} - {self.amount}"
