from rest_framework.permissions import BasePermission
from rest_framework.permissions import SAFE_METHODS

from django.utils import timezone
from billing.models import Subscription, SubscriptionStatus

# Defining access permissions
# Allows access only to admin users.
class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)

# Allows access only to financial staff.
class IsFinancial(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_financial
        )

# Object-level permission.
class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
    

# Admin can write, others can only read.
class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return bool(request.user and request.user.is_staff)

# Allows access only to members with an active subscription.
class IsMemberWithActiveSubscription(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        today = timezone.now().date()

        return Subscription.objects.filter(
            user=request.user,
            status=SubscriptionStatus.ACTIVE,
            end_date__gte=today
        ).exists()
    

# Allows users to access only their own notifications.
class IsNotificationOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user