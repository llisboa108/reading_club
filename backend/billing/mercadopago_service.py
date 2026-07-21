import hashlib
import hmac

import mercadopago
from django.conf import settings


class MercadoPagoNotConfigured(Exception):
    pass


def _sdk():
    if not settings.MERCADOPAGO_ACCESS_TOKEN:
        raise MercadoPagoNotConfigured(
            "MERCADOPAGO_ACCESS_TOKEN is not set - configure backend/.env "
            "(see .env.example) with real or sandbox credentials."
        )
    return mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)


def create_payment_preference(payment, back_url):
    """Create a Checkout Pro preference for a pending Payment.

    external_reference links the Mercado Pago payment back to our own
    Payment row so the webhook can find it later without trusting
    anything else in the notification body.
    """
    preference_data = {
        "items": [
            {
                "title": f"Assinatura {payment.subscription.plan.name}",
                "quantity": 1,
                "unit_price": float(payment.amount),
                "currency_id": "BRL",
            }
        ],
        "external_reference": str(payment.id),
        "back_urls": {
            "success": back_url,
            "pending": back_url,
            "failure": back_url,
        },
        "auto_return": "approved",
    }

    response = _sdk().preference().create(preference_data)
    body = response["response"]
    return body


def fetch_mp_payment(mp_payment_id):
    """Fetch the authoritative payment record from Mercado Pago's API.

    We never trust the status embedded in the webhook notification body -
    it's only used to know which id to look up.
    """
    response = _sdk().payment().get(mp_payment_id)
    return response["response"]


def verify_webhook_signature(x_signature, x_request_id, data_id):
    """Validate the x-signature header per Mercado Pago's webhook docs.

    Format: "ts=<unix ts>,v1=<hmac-sha256 hex>" over the manifest string
    "id:{data_id};request-id:{x_request_id};ts:{ts};".
    """
    if not settings.MERCADOPAGO_WEBHOOK_SECRET:
        raise MercadoPagoNotConfigured(
            "MERCADOPAGO_WEBHOOK_SECRET is not set - configure backend/.env."
        )

    if not x_signature:
        return False

    parts = dict(
        part.split("=", 1) for part in x_signature.split(",") if "=" in part
    )
    ts = parts.get("ts")
    v1 = parts.get("v1")
    if not ts or not v1:
        return False

    manifest = f"id:{data_id.lower()};request-id:{x_request_id};ts:{ts};"
    expected = hmac.new(
        settings.MERCADOPAGO_WEBHOOK_SECRET.encode(),
        manifest.encode(),
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(expected, v1)
