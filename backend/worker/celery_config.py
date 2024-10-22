import os

from celery import Celery

from worker.utils import TransactionAtomicTask

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("worker")

app.config_from_object("django.conf:settings", namespace="CELERY")
app.Task = TransactionAtomicTask

app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
