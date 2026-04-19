from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    PlanViewSet,
    PaymentViewSet,
    SubscriptionView,
    PaymentConfirmView,
)

router = DefaultRouter()
router.register("plans", PlanViewSet, basename="plans")
router.register("payments", PaymentViewSet, basename="payments")

urlpatterns = [
    path("subscription/", SubscriptionView.as_view(), name="subscription"),
    path("payments/<int:payment_id>/confirm/", PaymentConfirmView.as_view(), name="payment-confirm"),
]

urlpatterns += router.urls