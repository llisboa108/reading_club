from django.urls import path, include

from api.views import AnalyticsView

urlpatterns = [
    # Authentication / Accounts
    path("auth/", include("accounts.urls")),

    # Club domain
    path("club/", include("club.urls")),

    # Billing domain (quando existir)
    path("billing/", include("billing.urls")),

    # Cross-cutting
    path("analytics/", AnalyticsView.as_view(), name="analytics"),
]