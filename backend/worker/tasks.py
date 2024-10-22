import time

from worker.celery_config import app


@app.task
def test_task():
    print("This is a test task.")


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
