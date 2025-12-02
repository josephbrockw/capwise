#!/bin/bash
# Test command

command_test_help() {
    echo "Test Help:"
    echo "Usage: bb test [options]"
    echo "Description: Runs the full test suite or specific test subsets."
    echo "Options:"
    echo "  -b                Run only the Django tests."
    echo "                    Additional options for Django tests:"
    echo "                    --failfast       Stop running tests after first failure"
    echo "                    --keepdb         Preserve test DB between runs"
    echo "                    -k PATTERN       Only run tests matching pattern"
    echo "                    --parallel [N]   Run tests in parallel (N processes)"
    echo "                    --tag TAG        Only run tests with the specified tag"
    echo "                    --exclude-tag TAG Skip tests with the specified tag"
    echo "                    -v {0,1,2}       Verbosity level"
    echo "                    --debug-mode     Run tests in debug mode"
    echo "                    --noinput        Suppress all user prompts"
    echo "                    --collect-only   List tests without running them"
    echo "  -c                Run all the client tests (E2E, component, and unit)."
    echo "  --client-unit     Run only the Vitest tests."
    echo "  --e2e             Run only Cypress end-to-end (E2E) tests."
    echo "  --component       Run only Cypress component tests."
    echo "  --open            Open the Cypress test runner."
}

command_test_run() {
    run_django_tests=true
    run_cypress_e2e_tests=true
    run_cypress_component_tests=true
    run_vitest_tests=true
    backend_args=""

    while [[ $# -gt 0 ]]; do
        case $1 in
            -b)
                run_cypress_e2e_tests=false
                run_cypress_component_tests=false
                run_vitest_tests=false
                ;;
            -k)
                if [[ -z "$2" ]]; then
                    echo "Error: -k requires a test pattern"
                    exit 1
                fi
                backend_args="$backend_args -k $2"
                shift  # skip the -k
                shift  # skip the pattern
                continue
                ;;
            --failfast)
                backend_args="$backend_args --failfast"
                ;;
            --keepdb)
                backend_args="$backend_args --keepdb"
                ;;
            --parallel)
                if [[ ! -z "$2" && "$2" =~ ^[0-9]+$ ]]; then
                    backend_args="$backend_args --parallel $2"
                    shift
                else
                    backend_args="$backend_args --parallel"
                fi
                ;;
            --tag)
                if [[ -z "$2" ]]; then
                    echo "Error: --tag requires a tag name"
                    exit 1
                fi
                backend_args="$backend_args --tag $2"
                shift
                ;;
            --exclude-tag)
                if [[ -z "$2" ]]; then
                    echo "Error: --exclude-tag requires a tag name"
                    exit 1
                fi
                backend_args="$backend_args --exclude-tag $2"
                shift
                ;;
            --debug-mode)
                backend_args="$backend_args --debug-mode"
                ;;
            --noinput)
                backend_args="$backend_args --noinput"
                ;;
            --collect-only)
                backend_args="$backend_args --collect-only"
                ;;
            -c)
                run_django_tests=false
                ;;
            -v)
                run_django_tests=false
                run_cypress_e2e_tests=false
                run_cypress_component_tests=false
                ;;
            --e2e)
                run_django_tests=false
                run_cypress_component_tests=false
                run_vitest_tests=false
                ;;
            --component)
                run_django_tests=false
                run_cypress_e2e_tests=false
                run_vitest_tests=false
                ;;
            --open)
                cypress_open_command="(cd react && npm run cypress:open)"
                run_cypress_e2e_tests=false
                run_cypress_component_tests=false
                run_django_tests=false
                run_vitest_tests=false
                ;;
            *)
                echo "Unknown argument: $1"
                command_test_help
                exit 1
                ;;
        esac
        shift
    done

    if [ -n "$cypress_open_command" ]; then
        echo "Opening Cypress test runner..."
        eval "$cypress_open_command"
        exit 0
    fi

    # Run Django tests if enabled
    if [ "$run_django_tests" = true ]; then
        echo "Running Django tests..."
        start_time=$SECONDS
        if [ ! -z "$backend_args" ]; then
            exec_backend python manage.py test $backend_args
        else
            exec_backend python manage.py test
        fi
        django_exit_code=$?
        django_duration=$((SECONDS - start_time))
    fi

    if [ "$run_cypress_e2e_tests" = true ]; then
        echo "Running Cypress E2E tests..."
        start_time=$SECONDS
        if ! (cd react && npx cypress run --browser chrome --e2e); then
            cypress_e2e_exit_code=1
        fi
        cypress_e2e_duration=$((SECONDS - start_time))
    fi

    if [ "$run_cypress_component_tests" = true ]; then
        echo "Running Cypress Component tests..."
        start_time=$SECONDS
        if ! (cd react && npx cypress run --browser chrome --component); then
            cypress_component_exit_code=1
        fi
        cypress_component_duration=$((SECONDS - start_time))
    fi

    if [ "$run_vitest_tests" = true ]; then
        echo "Running Vitest tests..."
        start_time=$SECONDS
        if ! (cd react && npm run test:run); then
            vitest_exit_code=1
        fi
        vitest_duration=$((SECONDS - start_time))
    fi

    display_test_summary
}
