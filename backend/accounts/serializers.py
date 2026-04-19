from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import InviteCode, Profile

User = get_user_model()


# Register Serializer
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    invite_code = serializers.CharField(write_only=True)
    full_name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("email", "password", "invite_code", "full_name")

    def validate_invite_code(self, value):
        try:
            invite = InviteCode.objects.get(code=value)
        except InviteCode.DoesNotExist:
            raise serializers.ValidationError("Invalid invite code.")

        if not invite.can_be_used():
            raise serializers.ValidationError(
                "Invite code is no longer active."
            )

        return invite

    def create(self, validated_data):
        invite = validated_data.pop("invite_code")
        full_name = validated_data.pop("full_name")

        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"]
        )

        # Update profile automatically
        profile = user.profile
        profile.full_name = full_name
        profile.save()

        invite.register_use()

        return user

# Profile
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = (
            "full_name",
            "photo",
            "phone",
            "bio",
            "facebook",
            "instagram",
        )

# Loged user
class MeSerializer(serializers.ModelSerializer):
    is_admin = serializers.BooleanField(source="is_staff")
    is_financial = serializers.BooleanField()
    
    # Prevent return serializer as null
    profile = serializers.SerializerMethodField()
    def get_profile(self, obj):
        from accounts.models import Profile
        profile, _ = Profile.objects.get_or_create(user=obj)
        return ProfileSerializer(profile).data

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "is_admin",
            "is_financial",
            "profile",
        )


# Invite code serializer
class InviteCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = InviteCode
        fields = (
            "id",
            "code",
            "is_active",
            "max_uses",
            "used_count",
            "created_at",
        )
        read_only_fields = (
            "used_count",
            "created_at",
        )

# Profile update
class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = (
            "full_name",
            "photo",
            "phone",
            "bio",
            "facebook",
            "instagram",
        )

# Change Password
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)

    def validate_new_password(self, value):
        validate_password(value)
        return value

# Password validator serializer
class PasswordValiSerializer(serializers.Serializer):
    password = serializers.CharField()