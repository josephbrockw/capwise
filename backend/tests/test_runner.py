from django.test.runner import DiscoverRunner


class CollectOnlyTestRunner(DiscoverRunner):
    def __init__(self, **kwargs):
        self.collect_only = kwargs.pop("collect_only", False)
        super().__init__(**kwargs)

    @classmethod
    def add_arguments(cls, parser):
        super().add_arguments(parser)
        parser.add_argument(
            "--collect-only",
            action="store_true",
            help="List tests without running them",
        )

    def run_tests(self, test_labels, extra_tests=None, **kwargs):
        """
        Run the test suite with collect-only support
        """
        self.setup_test_environment()
        suite = self.build_suite(test_labels, extra_tests)

        if self.collect_only:
            print("\nCollected tests:")
            for test in suite:
                # Get test method name and class name
                test_method = str(test).split()[0]
                test_class = test.__class__.__name__
                test_module = test.__class__.__module__
                print(f"{test_module}.{test_class}.{test_method}")
            print(f"\nFound {suite.countTestCases()} tests.")
            return 0

        old_config = self.setup_databases()

        try:
            result = self.run_suite(suite)
        finally:
            self.teardown_databases(old_config)
            self.teardown_test_environment()

        return self.suite_result(suite, result)
