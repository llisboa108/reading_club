from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, extend_schema_view

from api.permissions import IsAdmin, IsFinancial

from .models import (
    Plan,
    Subscription,
    Payment,
    PaymentStatus,
)
from .serializers import (
    PlanSerializer,
    PlanWriteSerializer,
    SubscriptionSerializer,
    PaymentSerializer,
    PaymentCreateSerializer,
    PaymentConfirmSerializer,
)


# ---------------------------------------------------------
# Plans
# ---------------------------------------------------------

@extend_schema_view(
    list=extend_schema(tags=["Billing"], operation_id="planList"),
    retrieve=extend_schema(tags=["Billing"], operation_id="planRetrieve"),
)
class PlanViewSet(ModelViewSet):

    queryset = Plan.objects.filter(is_active=True)
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.user.is_staff:
            return PlanWriteSerializer
        return PlanSerializer


# ---------------------------------------------------------
# Subscription
# ---------------------------------------------------------

class SubscriptionView(RetrieveAPIView):

    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    # queryset necessário para spectacular
    queryset = Subscription.objects.all()

    @extend_schema(tags=["Billing"], operation_id="subscriptionRetrieve")
    def get_object(self):

        subscription = (
            Subscription.objects
            .filter(user=self.request.user)
            .order_by("-created_at")
            .first()
        )

        if not subscription:
            raise Subscription.DoesNotExist()

        return subscription


# ---------------------------------------------------------
# Payments
# ---------------------------------------------------------

@extend_schema_view(
    list=extend_schema(tags=["Billing"], operation_id="paymentsList"),
    retrieve=extend_schema(tags=["Billing"], operation_id="paymentsRetrieve"),
    create=extend_schema(tags=["Billing"], operation_id="paymentsCreate"),
)
class PaymentViewSet(ModelViewSet):

    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    # necessário para spectacular inferir id
    queryset = Payment.objects.all()

    def get_queryset(self):
        return Payment.objects.filter(
            subscription__user=self.request.user
        )

    def get_serializer_class(self):
        if self.action == "create":
            return PaymentCreateSerializer
        return PaymentSerializer

    def perform_create(self, serializer):

        subscription = (
            Subscription.objects
            .filter(
                user=self.request.user,
                status__in=["PENDING", "ACTIVE"]
            )
            .order_by("-created_at")
            .first()
        )

        if not subscription:
            raise ValueError(
                "User has no active or pending subscription."
            )

        serializer.save(subscription=subscription)


# ---------------------------------------------------------
# Payment confirmation
# ---------------------------------------------------------

class PaymentConfirmView(APIView):

    permission_classes = [IsAuthenticated, IsFinancial]

    @extend_schema(
        tags=["Billing"],
        operation_id="paymentsConfirm",
        summary="Confirm a payment",
        description=(
            "Confirms a pending payment. "
            "Only financial users can perform this action."
        ),
        request=PaymentConfirmSerializer,
        responses={200: None},
    )
    def post(self, request, payment_id):

        payment = get_object_or_404(Payment, id=payment_id)

        serializer = PaymentConfirmSerializer(
            data=request.data,
            context={
                "payment": payment,
                "user": request.user,
            },
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"detail": "Payment confirmed successfully."}
        )