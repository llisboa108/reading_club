from rest_framework import serializers
from django.utils import timezone

from .models import (
    Plan,
    Subscription,
    Payment,
    PaymentStatus,
)

# Plan serializers
class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = (
            "id",
            "name",
            "description",
            "price",
            "is_active",
        )

class PlanWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = (
            "name",
            "description",
            "price",
            "is_active",
        )

# Subscription serializer
class SubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer()

    class Meta:
        model = Subscription
        fields = (
            "id",
            "status",
            "plan",
            "start_date",
            "end_date",
            "next_billing_date",
        )

# Payment serializers
class PaymentSerializer(serializers.ModelSerializer):
    method_display = serializers.CharField(
        source="get_method_display",
        read_only=True
    )

    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True
    )

    class Meta:
        model = Payment
        fields = (
            "id",
            "amount",
            "method",
            "method_display",
            "status",
            "status_display",
            "issued_at",
            "due_date",
            "paid_at",
            "notes",
            "receipt",
        )
        read_only_fields = (
            "status",
            "paid_at",
        )

class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = (
            "amount",
            "method",
            "due_date",
            "external_id",
            "receipt",
            "notes",
        )

class PaymentConfirmSerializer(serializers.Serializer):
    confirm = serializers.BooleanField()

    def validate_confirm(self, value):
        if value is not True:
            raise serializers.ValidationError(
                "Confirmation must be true."
            )
        return value

    def save(self, **kwargs):
        payment = self.context["payment"]
        user = self.context["user"]

        if payment.status != PaymentStatus.PENDING:
            raise serializers.ValidationError(
                "Payment is not pending."
            )

        payment.confirm(user=user)

        return payment
