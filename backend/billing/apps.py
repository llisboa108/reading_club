import os
import sys

from django.apps import AppConfig

class BillingConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = 'billing'

    def ready(self):
        import billing.signals

        # Invoked via `manage.py <subcommand>`: only start the scheduler for
        # `runserver`, and only once - its autoreloader re-executes this
        # module in a child process with RUN_MAIN=true, so the first pass
        # (the launcher process) skips starting it to avoid running twice.
        # One-off commands (test, migrate, shell, renew_subscriptions itself,
        # ...) never start it. Under a real WSGI/ASGI server in production,
        # sys.argv doesn't look like this at all, so the scheduler always
        # starts there.
        if sys.argv[0].endswith("manage.py"):
            if len(sys.argv) < 2 or sys.argv[1] != "runserver":
                return
            if os.environ.get("RUN_MAIN") != "true":
                return

        from . import scheduler
        scheduler.start()