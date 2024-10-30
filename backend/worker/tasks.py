from datetime import timedelta

from celery.schedules import crontab
from django.conf import settings
from django.db.models import Q
from django.utils import timezone

from account.emails import experiment_report_email
from account.models import OneTimePassword
from worker.celery_config import app

schedule = {
    "make_a_wish": {
        "task": "worker.tasks.make_a_wish",
        "schedule": crontab(minute="11", hour="11"),
    },
    "delete_expired_otps": {
        "task": "worker.tasks.delete_expired_otps",
        "schedule": crontab(hour=0, minute=0),
    },
}

if settings.DEBUG:  # pragma: no cover
    schedule["test_task"] = {
        "task": "worker.tasks.test_task",
        "schedule": timedelta(minutes=10),
    }

app.conf.beat_schedule = schedule


@app.task
def test_task():
    print("This is a test task.")  # pragma: no cover


@app.task
def make_a_wish():
    print("11:11 - Make a wish!")  # pragma: no cover


@app.task
def delete_invalid_otps():
    invalid_cond = Q(expires__lt=timezone.now()) | Q(is_active=False)
    invalid_otps = OneTimePassword.objects.filter(invalid_cond)
    invalid_otps.delete()


@app.task
def send_experiment_report_email():
    email = experiment_report_email()
    email.send()
