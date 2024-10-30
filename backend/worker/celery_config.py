import os

from celery import Celery

from worker.utils import TransactionAtomicTask

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("worker")

app.config_from_object("django.conf:settings", namespace="CELERY")
app.Task = TransactionAtomicTask

app.autodiscover_tasks()
