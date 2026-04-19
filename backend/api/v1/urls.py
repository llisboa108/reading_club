from django.urls import path, include

urlpatterns = [
    # Authentication / Accounts
    path("auth/", include("accounts.urls")),

    # Club domain
    path("club/", include("club.urls")),

    # Billing domain (quando existir)
    path("billing/", include("billing.urls")),
]