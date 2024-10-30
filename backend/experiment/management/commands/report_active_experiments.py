from django.core.management.base import BaseCommand

from experiment.process import generate_active_experiments_report


class Command(BaseCommand):
    help = "Generate a report of all active experiments."

    def handle(self, *args, **kwargs):
        report = generate_active_experiments_report()
        self.stdout.write(report)
