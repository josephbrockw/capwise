import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("worker")

app.config_from_object("django.conf:settings", namespace="CELERY")
app.conf.task_routes = {
    "worker.tasks.say_hello": {"queue": "queue1"},
    "worker.tasks.say_goodbye": {"queue": "queue2"},
}
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
