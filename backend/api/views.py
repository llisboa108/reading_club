from dateutil.relativedelta import relativedelta
from django.contrib.auth import get_user_model
from django.db.models import Avg, Count, Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from billing.models import Payment, PaymentStatus, Subscription, SubscriptionStatus
from club.models import Meet, MeetUser, Reading

from .permissions import IsAdmin, IsFinancial

User = get_user_model()


def _months_back(n):
    """First-of-month boundary n months ago, e.g. n=11 -> 12 months inclusive."""
    today = timezone.now().date().replace(day=1)
    return today - relativedelta(months=n)


def _fill_month_series(rows, key="month", value_key="total", months=12):
    """Turn a sparse {month: value} queryset into a dense 12-month series,
    so a month with zero activity shows as 0 instead of being missing -
    important for charts, which would otherwise skip gaps silently.
    """
    by_month = {row[key].strftime("%Y-%m"): row[value_key] for row in rows}
    series = []
    for i in range(months - 1, -1, -1):
        month_date = _months_back(i)
        month_key = month_date.strftime("%Y-%m")
        series.append({"month": month_key, "value": by_month.get(month_key) or 0})
    return series


class AnalyticsView(APIView):
    """Admin/financial-only dashboard: revenue, subscriptions, membership
    and reading-club activity, aggregated from real data.
    """

    permission_classes = [IsAuthenticated, IsAdmin | IsFinancial]

    @extend_schema(
        tags=["Analytics"],
        operation_id="analyticsRetrieve",
        summary="Aggregated analytics for the admin/financial dashboard",
        responses={200: OpenApiTypes.OBJECT},
    )
    def get(self, request):
        since = _months_back(11)

        # --- Revenue ---
        revenue_rows = (
            Payment.objects.filter(status=PaymentStatus.CONFIRMED, paid_at__date__gte=since)
            .annotate(month=TruncMonth("paid_at"))
            .values("month")
            .annotate(total=Sum("amount"))
            .order_by("month")
        )
        revenue_by_month = _fill_month_series(revenue_rows)

        payments_by_method = list(
            Payment.objects.filter(status=PaymentStatus.CONFIRMED)
            .values("method")
            .annotate(count=Count("id"), total=Sum("amount"))
            .order_by("-total")
        )

        pending = Payment.objects.filter(status=PaymentStatus.PENDING)
        pending_total = pending.aggregate(total=Sum("amount"))["total"] or 0

        this_month_start = timezone.now().date().replace(day=1)
        revenue_this_month = (
            Payment.objects.filter(
                status=PaymentStatus.CONFIRMED, paid_at__date__gte=this_month_start
            ).aggregate(total=Sum("amount"))["total"]
            or 0
        )

        # --- Subscriptions ---
        subscriptions_by_status = list(
            Subscription.objects.values("status").annotate(count=Count("id")).order_by("status")
        )
        active_subscriptions = Subscription.objects.filter(
            status=SubscriptionStatus.ACTIVE
        ).select_related("plan")
        mrr = sum((s.plan.price for s in active_subscriptions), start=0)

        # --- Membership growth ---
        members_rows = (
            User.objects.filter(is_staff=False, date_joined__date__gte=since)
            .annotate(month=TruncMonth("date_joined"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )
        new_members_by_month = _fill_month_series(members_rows, value_key="count")
        total_members = User.objects.filter(is_staff=False).count()

        # --- Reading activity ---
        readings_by_status = list(
            Reading.objects.values("status").annotate(count=Count("id")).order_by("status")
        )

        meets_rows = (
            Meet.objects.filter(meet_date__date__gte=since)
            .annotate(month=TruncMonth("meet_date"))
            .values("month")
            .annotate(count=Count("id", distinct=True))
            .order_by("month")
        )
        meets_by_month = _fill_month_series(meets_rows, value_key="count")

        avg_attendance = (
            MeetUser.objects.values("meet").annotate(count=Count("id")).aggregate(
                avg=Avg("count")
            )["avg"]
            or 0
        )

        return Response(
            {
                "kpis": {
                    "mrr": mrr,
                    "revenue_this_month": revenue_this_month,
                    "active_subscriptions": active_subscriptions.count(),
                    "total_members": total_members,
                    "pending_payments_count": pending.count(),
                    "pending_payments_total": pending_total,
                    "avg_meet_attendance": round(avg_attendance, 1),
                },
                "revenue_by_month": revenue_by_month,
                "payments_by_method": payments_by_method,
                "subscriptions_by_status": subscriptions_by_status,
                "new_members_by_month": new_members_by_month,
                "readings_by_status": readings_by_status,
                "meets_by_month": meets_by_month,
            }
        )
