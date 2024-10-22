from celery import Task
from django.db import transaction


class TransactionAtomicTask(Task):
    """
    A Celery Task that wraps the execution of the task in a database transaction.
    """

    def __call__(self, *args, **kwargs):
        with transaction.atomic():
            return super().__call__(*args, **kwargs)
