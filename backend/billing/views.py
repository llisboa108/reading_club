import logging

from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.conf import settings
from django.db.models import ProtectedError
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, extend_schema_view

from api.permissions import IsAdmin, IsAdminOrReadOnly, IsFinancial

from . import mercadopago_service
from .mercadopago_service import MercadoPagoNotConfigured
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
    PaymentAdminSerializer,
    PaymentCreateSerializer,
    PaymentConfirmSerializer,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------
# Plans
# ---------------------------------------------------------

@extend_schema_view(
    list=extend_schema(tags=["Billing"], operation_id="planList"),
    retrieve=extend_schema(tags=["Billing"], operation_id="planRetrieve"),
)
class PlanViewSet(ModelViewSet):

    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    # necessário para spectacular inferir o model (get_queryset é o real filtro em runtime)
    queryset = Plan.objects.all()

    def get_queryset(self):
        # Admins manage the full catalogue (including inactive plans);
        # everyone else only ever needs to see plans they could subscribe to.
        if self.request.user.is_staff:
            return Plan.objects.all()
        return Plan.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return PlanWriteSerializer
        return PlanSerializer

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {
                    "detail": (
                        "Este plano não pode ser excluído porque há assinaturas "
                        "associadas a ele. Desative-o em vez de excluir."
                    )
                },
                status=status.HTTP_409_CONFLICT,
            )


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

    def get_permissions(self):
        if self.action in ("destroy", "pending"):
            return [IsAuthenticated(), IsFinancial()]
        return [IsAuthenticated()]

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

    @extend_schema(
        tags=["Billing"],
        operation_id="paymentsPendingList",
        summary="List pending payments across all members",
        description="Only financial staff can list every member's pending payments.",
        responses={200: PaymentAdminSerializer(many=True)},
    )
    @action(detail=False, methods=["get"], url_path="pending")
    def pending(self, request):
        payments = (
            Payment.objects
            .select_related("subscription__user__profile")
            .filter(status=PaymentStatus.PENDING)
            .order_by("due_date")
        )

        serializer = PaymentAdminSerializer(
            payments, many=True, context=self.get_serializer_context()
        )
        return Response(serializer.data)


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


# ---------------------------------------------------------
# Mercado Pago
# ---------------------------------------------------------

class MercadoPagoPreferenceView(APIView):

    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Billing"],
        operation_id="paymentsMercadoPagoPreference",
        summary="Create a Mercado Pago checkout preference for a payment",
        description=(
            "Creates a Checkout Pro preference for one of the caller's own "
            "pending payments and returns the checkout URL to redirect to."
        ),
        request=None,
        responses={200: None},
    )
    def post(self, request, payment_id):
        payment = get_object_or_404(
            Payment, id=payment_id, subscription__user=request.user
        )

        if payment.status != PaymentStatus.PENDING:
            return Response(
                {"detail": "Only pending payments can be paid via Mercado Pago."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            preference = mercadopago_service.create_payment_preference(
                payment, back_url=f"{settings.FRONTEND_URL}/billing"
            )
        except MercadoPagoNotConfigured:
            logger.error("Mercado Pago preference requested but not configured", exc_info=True)
            return Response(
                {
                    "detail": (
                        "O pagamento via Mercado Pago não está disponível no "
                        "momento. Tenta novamente mais tarde ou usa outro método."
                    )
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        checkout_url = preference.get("init_point") or preference.get(
            "sandbox_init_point"
        )
        return Response({"init_point": checkout_url})


class MercadoPagoWebhookView(APIView):

    permission_classes = [AllowAny]

    @extend_schema(exclude=True)
    def post(self, request):
        topic = request.query_params.get("type") or request.data.get("type")
        data_id = request.query_params.get("data.id") or (
            request.data.get("data") or {}
        ).get("id")

        # Mercado Pago also sends other topics (merchant_order, etc.) we
        # don't act on - acknowledge them so it stops retrying.
        if topic != "payment" or not data_id:
            return Response(status=status.HTTP_200_OK)

        x_signature = request.headers.get("x-signature")
        x_request_id = request.headers.get("x-request-id")

        try:
            valid = mercadopago_service.verify_webhook_signature(
                x_signature, x_request_id, str(data_id)
            )
        except MercadoPagoNotConfigured:
            logger.error("Mercado Pago webhook received but not configured", exc_info=True)
            return Response(status=status.HTTP_503_SERVICE_UNAVAILABLE)

        if not valid:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        mp_payment = mercadopago_service.fetch_mp_payment(data_id)

        payment = Payment.objects.filter(
            id=mp_payment.get("external_reference")
        ).first()
        if not payment:
            return Response(status=status.HTTP_404_NOT_FOUND)

        # Idempotent: a payment we already confirmed (manually or from a
        # previous webhook delivery) is never re-processed.
        if payment.status == PaymentStatus.CONFIRMED:
            return Response(status=status.HTTP_200_OK)

        if mp_payment.get("status") == "approved":
            if not payment.external_id:
                payment.external_id = str(data_id)
                payment.save(update_fields=["external_id"])
            payment.confirm(user=None)

        return Response(status=status.HTTP_200_OK)