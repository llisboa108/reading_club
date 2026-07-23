from rest_framework.throttling import AnonRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """Limits login attempts per IP address to slow down brute-forcing."""

    scope = "login"


class ContactMessageRateThrottle(AnonRateThrottle):
    """Limits public contact-form submissions per IP address to slow down spam."""

    scope = "contact"
