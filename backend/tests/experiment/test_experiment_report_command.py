import os
from io import StringIO

from django.core.management import call_command
from django.test import TestCase

from experiment.models import Experiment


class ReportActiveExperimentsCommandTest(TestCase):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    fixtures = [os.path.join(base_dir, "fixtures", "experiments.yaml")]

    def test_generate_report_command_with_no_active_experiments(self):
        Experiment.objects.update(is_active=False)
        out = StringIO()
        call_command("report_active_experiments", stdout=out)
        self.assertIn("No active experiments found.", out.getvalue())

    def test_generate_report_command_with_active_experiments(self):
        out = StringIO()
        call_command("report_active_experiments", stdout=out)
        self.assertIn("Active Experiments Report:", out.getvalue())
        self.assertIn("Unseen University Ad Campaign", out.getvalue())
        self.assertIn(
            "Testing different variations of advertisements for the Unseen University.",
            out.getvalue(),
        )
        self.assertIn("Name,Weight,Views,Conversion Rate", out.getvalue())
        self.assertIn("Wizards Only Ad,1,50,10.00%", out.getvalue())
        self.assertIn("General Magic Ad,2,100,15.00%", out.getvalue())

        # Does not include inactive experiment
        self.assertNotIn("Lancre Witch Potion Sales", out.getvalue())
