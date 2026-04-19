from django.contrib import admin
from .models import Plan, Subscription, Payment

@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name",)


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ("user", "plan", "status", "start_date", "end_date", "next_billing_date")
    list_filter = ("status", "plan")
    search_fields = ("user__email",)
    date_hierarchy = "start_date"


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "subscription",
        "amount",
        "method",
        "status",
        "due_date",
        "paid_at",
    )

    list_filter = ("method", "status")
    search_fields = ("subscription__user__email",)
    date_hierarchy = "issued_at"

    readonly_fields = ("issued_at",)

    fieldsets = (
        ("Informações básicas", {
            "fields": (
                "subscription",
                "amount",
                "method",
                "status",
            )
        }),
        ("Datas", {
            "fields": (
                "issued_at",
                "due_date",
                "paid_at",
            )
        }),
        ("Mercado Pago", {
            "fields": ("external_id",),
        }),
        ("PIX / Dinheiro", {
            "fields": (
                "receipt",
                "confirmed_by",
            )
        }),
        ("Observações", {
            "fields": ("notes",),
        }),
    )
