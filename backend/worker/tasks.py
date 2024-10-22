import time
from datetime import timedelta

from celery.schedules import crontab

from worker.celery_config import app

app.conf.beat_schedule = {
    "test_task": {
        "task": "worker.tasks.test_task",
        "schedule": timedelta(minutes=10),
    },
    "make_a_wish": {
        "task": "worker.tasks.make_a_wish",
        "schedule": crontab(minute="11", hour="11"),
    },
}


@app.task
def test_task():
    print("This is a test task.")


@app.task
def make_a_wish():
    print("11:11 - Make a wish!")


@app.task
def say_hello(a, b, name=None):
    time.sleep(3)
    if name:
        print(f"Hi, {name}! I'm a Django task.")
    print(f"Sum of {a} and {b} is {a + b}.")
    return a + b


@app.task
def say_goodbye():
    time.sleep(3)
    print("Goodbye!")
