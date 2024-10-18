from celery import Celery

app = Celery("celeryworker")
app.config_from_object("config", namespace="CELERY")
