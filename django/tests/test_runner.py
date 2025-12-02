from django.conf import settings
from django.test.runner import DiscoverRunner


class CollectOnlyTestRunner(DiscoverRunner):
    def __init__(self, **kwargs):
        self.collect_only = kwargs.pop("collect_only", False)
        # Ensure test discovery works in the tests directory
        kwargs.setdefault("pattern", "test*.py")
        if not kwargs.get("top_level"):
            kwargs["top_level"] = settings.BASE_DIR
        super().__init__(**kwargs)

    @classmethod
    def add_arguments(cls, parser):
        super().add_arguments(parser)
        parser.add_argument(
            "--collect-only",
            action="store_true",
            help="List tests without running them",
        )

    def run_tests(self, test_labels, **kwargs):
        """
        Run the test suite with collect-only support
        """
        # If no test labels are provided, discover all tests
        if not test_labels:
            test_labels = ["tests"]

        self.setup_test_environment()
        suite = super().build_suite(test_labels)

        if self.collect_only:
            print("\nCollected tests:")
            for test in suite:
                # Get test method name and class name
                test_method = str(test).split()[0]
                test_class = test.__class__.__name__
                test_module = test.__class__.__module__
                print(f"{test_module}.{test_class}.{test_method}")
            print(f"\nFound {suite.countTestCases()} tests.")
            self.teardown_test_environment()
            return 0

        # Set up databases
        old_config = self.setup_databases()

        try:
            result = self.run_suite(suite)
        finally:
            # Clean up databases
            self.teardown_databases(old_config)
            self.teardown_test_environment()

        return self.suite_result(suite, result)
