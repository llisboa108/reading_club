from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    PlanViewSet,
    PaymentViewSet,
    SubscriptionView,
    SubscriptionAdminViewSet,
    PaymentConfirmView,
    MercadoPagoPreferenceView,
    MercadoPagoWebhookView,
)

router = DefaultRouter()
router.register("plans", PlanViewSet, basename="plans")
router.register("payments", PaymentViewSet, basename="payments")
router.register("subscriptions", SubscriptionAdminViewSet, basename="subscriptions")

urlpatterns = [
    path("subscription/", SubscriptionView.as_view(), name="subscription"),
    path("payments/<int:payment_id>/confirm/", PaymentConfirmView.as_view(), name="payment-confirm"),
    path(
        "payments/<int:payment_id>/mercadopago-preference/",
        MercadoPagoPreferenceView.as_view(),
        name="payment-mercadopago-preference",
    ),
    path(
        "mercadopago/webhook/",
        MercadoPagoWebhookView.as_view(),
        name="mercadopago-webhook",
    ),
]

urlpatterns += router.urls