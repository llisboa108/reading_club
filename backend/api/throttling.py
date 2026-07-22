from rest_framework.throttling import AnonRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """Limits login attempts per IP address to slow down brute-forcing."""

    scope = "login"
