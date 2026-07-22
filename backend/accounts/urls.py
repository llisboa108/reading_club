from django.urls import path
from rest_framework.routers import DefaultRouter

from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    MeView,
    InviteCodeViewSet,
    ProfileView,
    MemberListView,
    ValidatePasswordView,
    ChangePasswordView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    ThrottledTokenObtainPairView,
)

router = DefaultRouter()
router.register("invite-codes", InviteCodeViewSet, basename="invite-codes")

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", MeView.as_view(), name="me"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("members/", MemberListView.as_view(), name="members"),
    path("validate-password/", ValidatePasswordView.as_view()),
    path("change-password/", ChangePasswordView.as_view()),
    path("password-reset/", PasswordResetRequestView.as_view(), name="password_reset"),
    path("password-reset-confirm/", PasswordResetConfirmView.as_view(), name="password_reset_confirm"),

    path("login/", ThrottledTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

urlpatterns += router.urls
