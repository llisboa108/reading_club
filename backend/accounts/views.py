from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from drf_spectacular.utils import extend_schema, extend_schema_view
from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
User = get_user_model()

from .models import InviteCode
from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    RetrieveAPIView,
    RetrieveUpdateAPIView,
    UpdateAPIView,
)
from .serializers import (
    RegisterSerializer,
    MeSerializer,
    MemberListSerializer,
    InviteCodeSerializer,
    ProfileUpdateSerializer,
    ChangePasswordSerializer,
    PasswordValiSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)
from api.permissions import IsAdmin

# Invite code view
@extend_schema_view(
    list=extend_schema(tags=["Auth"]),
    retrieve=extend_schema(tags=["Auth"]),
    create=extend_schema(tags=["Auth"]),
    update=extend_schema(tags=["Auth"]),
    partial_update=extend_schema(tags=["Auth"]),
    destroy=extend_schema(tags=["Auth"]),
)
class InviteCodeViewSet(ModelViewSet):
    queryset = InviteCode.objects.all().order_by("-created_at")
    serializer_class = InviteCodeSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

# Register view
class RegisterView(CreateAPIView):

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    @extend_schema(tags=["Auth"])
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"message": "Account created successfully"},
            status=status.HTTP_201_CREATED
        )

# ME view
class MeView(RetrieveAPIView):
    serializer_class = MeSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["Auth"])
    def get_object(self):
        return self.request.user

# Profile view
@extend_schema(tags=["Auth"])
class ProfileView(RetrieveUpdateAPIView):

    serializer_class = ProfileUpdateSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    @extend_schema(tags=["Auth"])
    def get_object(self):
        return self.request.user.profile

# Members list view
class MemberListView(ListAPIView):
    serializer_class = MemberListSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        return User.objects.select_related("profile").filter(
            is_active=True
        ).order_by("profile__full_name", "email")

# Change password view
class ChangePasswordView(UpdateAPIView):

    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["Auth"])
    def update(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user

        if not user.check_password(serializer.validated_data["old_password"]):
            return Response(
                {"detail": "Old password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save()

        return Response({"detail": "Password updated successfully."})
    

# Validate password to real time validation in frontend
class ValidatePasswordView(APIView):

    serializer_class = PasswordValiSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Auth"],
        request=PasswordValiSerializer,
        responses={200: None},
    )
    def post(self, request):

        serializer = PasswordValiSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        password = serializer.validated_data["password"]

        try:
            validate_password(password, request.user)
        except Exception as e:
            return Response(
                {"errors": e.messages},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({"valid": True})


# Forgot password: request a reset link by email
class PasswordResetRequestView(APIView):

    serializer_class = PasswordResetRequestSerializer
    permission_classes = [AllowAny]

    @extend_schema(
        tags=["Auth"],
        request=PasswordResetRequestSerializer,
        responses={200: None},
    )
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.filter(
            email=serializer.validated_data["email"]
        ).first()

        # Always return the same generic message whether or not the email
        # is registered, so this endpoint can't be used to enumerate users
        # (unlike RegisterView, which does reveal validation errors).
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = PasswordResetTokenGenerator().make_token(user)
            reset_link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

            send_mail(
                subject="Redefinição de senha - Clube de Leitura",
                message=(
                    "Recebemos um pedido para redefinir a sua senha.\n\n"
                    f"Use o link abaixo para escolher uma nova senha:\n{reset_link}\n\n"
                    "Se não foi você quem pediu, ignore este e-mail."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
            )

        return Response(
            {"detail": "If that email exists, a reset link has been sent."}
        )


# Forgot password: set a new password from the emailed uid/token
class PasswordResetConfirmView(APIView):

    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [AllowAny]

    @extend_schema(
        tags=["Auth"],
        request=PasswordResetConfirmSerializer,
        responses={200: None},
    )
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user_id = force_str(urlsafe_base64_decode(serializer.validated_data["uid"]))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        token_valid = user and PasswordResetTokenGenerator().check_token(
            user, serializer.validated_data["token"]
        )

        if not token_valid:
            return Response(
                {"detail": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save()

        return Response({"detail": "Password updated successfully."})