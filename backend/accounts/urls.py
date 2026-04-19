from django.urls import path
from rest_framework.routers import DefaultRouter

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    RegisterView,
    MeView,
    InviteCodeViewSet,
    ProfileView,
    ValidatePasswordView,
    ChangePasswordView,
)

router = DefaultRouter()
router.register("invite-codes", InviteCodeViewSet, basename="invite-codes")

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", MeView.as_view(), name="me"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("validate-password/", ValidatePasswordView.as_view()),
    path("change-password/", ChangePasswordView.as_view()),

    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

urlpatterns += router.urls
