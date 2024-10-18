from celery import Celery

app = Celery("celeryworker")
app.config_from_object("config", namespace="CELERY")
app.conf.imports = "worker.tasks"
app.autodiscover_tasks()
