from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from drf_spectacular.utils import extend_schema, extend_schema_view
from django.contrib.auth.password_validation import validate_password

from .models import InviteCode
from rest_framework.generics import (
    CreateAPIView,
    RetrieveAPIView,
    RetrieveUpdateAPIView,
    UpdateAPIView,
)
from .serializers import (
    RegisterSerializer,
    MeSerializer,
    InviteCodeSerializer,
    ProfileUpdateSerializer,
    ChangePasswordSerializer,
    PasswordValiSerializer,
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