import os

from django.test import TestCase

from experiment.models import Experiment
from experiment.process import generate_active_experiments_report


class GenerateActiveExperimentsReportTest(TestCase):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    fixtures = [
        os.path.join(base_dir, "fixtures/experiments.yaml"),
    ]

    def test_generate_active_experiments_report_with_no_active_experiments(self):
        Experiment.objects.update(is_active=False)
        report = generate_active_experiments_report()
        self.assertEqual(report, "No active experiments found.")

    def test_generate_active_experiments_report_with_active_experiments(self):
        report = generate_active_experiments_report()

        # Check that the report starts with the correct header
        self.assertIn("Active Experiments Report:", report)

        # Check the presence of experiment data in the report
        self.assertIn("Experiment: Unseen University Ad Campaign", report)
        self.assertIn(
            "Description: Testing different variations of advertisements "
            "for the Unseen University.",
            report,
        )
        self.assertIn("Created at:", report)
        self.assertIn("Variations:", report)

        # Check variation data
        self.assertIn("Name,Weight,Views,Conversion Rate", report)
        self.assertIn("Wizards Only Ad,1,50,10.00%", report)
        self.assertIn("General Magic Ad,2,100,15.00%", report)

        # Check that inactive experiments are not included
        self.assertNotIn("Lancre Witch Potion Sales", report)

    def test_generate_active_experiments_report_with_conversion_rate(self):
        # Update seen and conversion counts for variation testing
        experiment = Experiment.objects.get(name="Ankh-Morpork Recruitment Campaign")
        variation = experiment.variations.first()
        variation.views = 10
        variation.conversions = 3
        variation.save()

        report = generate_active_experiments_report()

        # Check that the conversion rate calculation is correct
        expected_conversion_rate = (
            f"{variation.name},{variation.weight},"
            f"{variation.views},{variation.conversions / variation.views:.2%}"
        )
        self.assertIn(expected_conversion_rate, report)
