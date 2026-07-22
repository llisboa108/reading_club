import logging

from apscheduler.schedulers.background import BackgroundScheduler
from django.core.management import call_command

logger = logging.getLogger(__name__)

_scheduler = None


def _run_command(command_name):
    try:
        call_command(command_name)
    except Exception:
        logger.exception("Scheduled command %s failed", command_name)


def start():
    """Start the in-process job scheduler (call once, from AppConfig.ready()).

    Runs renew_subscriptions and send_meet_reminders daily, so the app is
    self-sufficient without any external cron/task scheduler configured.

    Caveat: this is an in-process scheduler, so it only works correctly with
    a single running app process. Behind a multi-worker WSGI server (e.g.
    gunicorn with more than one worker), each worker would start its own
    scheduler and the jobs would fire once per worker - either pin this to a
    single worker/process, or switch to an external scheduler (system cron
    calling `python manage.py renew_subscriptions`, or Celery beat) once the
    app is deployed behind more than one process.
    """
    global _scheduler
    if _scheduler is not None:
        return

    _scheduler = BackgroundScheduler(timezone="UTC")
    _scheduler.add_job(
        _run_command,
        "cron",
        args=["renew_subscriptions"],
        hour=6,
        minute=0,
        id="renew_subscriptions",
    )
    _scheduler.add_job(
        _run_command,
        "cron",
        args=["send_meet_reminders"],
        hour=7,
        minute=0,
        id="send_meet_reminders",
    )
    _scheduler.start()
    logger.info("Billing scheduler started (renew_subscriptions, send_meet_reminders)")
