from django.contrib import admin
from .models import User, Profile, InviteCode


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "is_staff", "is_financial", "is_active")
    search_fields = ("email",)
    ordering = ("email",)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("full_name", "user", "phone")
    search_fields = ("full_name", "user__email")


@admin.register(InviteCode)
class InviteCodeAdmin(admin.ModelAdmin):
    list_display = ("code", "is_active", "used_count", "max_uses", "created_at")
    list_filter = ("is_active",)
    search_fields = ("code",)