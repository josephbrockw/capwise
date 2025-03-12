#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Arrays to store test results
declare -a failed_tests
django_exit_code=0
cypress_e2e_exit_code=0
cypress_component_exit_code=0
vitest_exit_code=0

exec_backend() {
    docker compose exec backend "$@"
}

exec_db() {
    docker compose exec db "$@"
}

# Function to display general usage
usage() {
    echo "General Usage: $0 workflow_name [additional_args]"
    echo "Available workflows:"
    echo "  test           - Run the full test suite or selective tests."
    echo "                   - Accepts '-b' to run only Django tests."
    echo "                   - Accepts '-c' to run all client tests (Cypress E2E, Cypress Component, Vitest)."
    echo "                   - Accepts '-v' to run only Vitest tests."
    echo "                   - Accepts '--component' to run only Cypress component tests."
    echo "                   - Accepts '--e2e' to run only Cypress end-to-end tests."
    echo "                   - Accepts '--type=testtype' and '--k=keyword' for filtering Django tests."
    echo "                   - Accepts '--open' to open Cypress test client."
    echo "  clean          - Shuts down Docker containers and rebuilds new ones."
    echo "  shell          - Enters the user into a Django shell inside the backend container."
    echo "  psql           - Enters the user into a Postgres shell inside the db container."
    echo "  coverage       - Runs a coverage report for the Django test suite."
    echo "  quality        - Runs flake8, black, and isort."
    echo "  dumpdata       - Dumps the data from the database into a YAML file (default: default.yaml)."
    echo "                   - Accepts an optional output file name as an argument."
    echo "  loaddata       - Loads data from a given file path into the database."
    echo "  makemigrations - Makes migrations for the database."
    echo "  migrate        - Runs Django migrations inside the backend container."
    echo "  app            - Creates a new Django app with the given name."
    echo "  manage         - Execute Django management commands inside the backend container."
    echo "Use '$0 workflow_name --help' for more information on a specific workflow."
}

# Function for testing help
test_help() {
    echo "Test Help:"
    echo "Usage: $0 test [options]"
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

# Function for full suite testing help
full_test_help() {
    echo "Full Test Help:"
    echo "Usage: $0 workflow1 "
    echo "Description: Runs the pytest test suite, flushes the db, and runs"
    echo "the cypress tests."
}

# Function for spinning up a new instnace help
clean_help() {
    echo "Clean Help:"
    echo "Usage: $0 clean [options]"
    echo "Description: Tears down the docker containers and builds new ones running"
    echo "in detatched mode."
}

# Function for entering an app shell help
shell_help() {
    echo "Shell Help:"
    echo "Usage: $0 shell [options]"
    echo "Description: Enter into a Flask shell inside the app container."
}

# Function for entering a db shell help
db_help() {
    echo "DB ShellHelp:"
    echo "Usage: $0 shell [options]"
    echo "Description: Enter into a Postgres shell inside the db container."
}

coverage_help() {
    echo "Coverage Help"
    echo "Usage: $0 coverage [options]"
    echo "Description: Runs a coverage report for the Django test suite"
    echo ""
    echo "Options:"
    echo "  --html   Generate HTML coverage report"
    echo "  --xml    Generate XML coverage report"
}

quality_help() {
    echo "Quality Help"
    echo "Usage: $0 quality [options]"
    echo "Description: Runs flake8, black, and isort."
}

dumpdata_help() {
    echo "Dumpdata Help"
    echo "Usage: $0 dumpdata [output_file_name]"
    echo "Description: Dumps the data from the database into a yaml file called default.yaml by default."
    echo "             You can optionally specify an output file name."
}

makemigrations_help() {
    echo "Make Migrations Help"
    echo "Usage: $0 makemigrations"
    echo "Description: Makes migrations for the database."
}

migrate_help() {
    echo "Usage: bb migrate [--rollback app_name migration_name]"
    echo ""
    echo "Runs Django migrations inside the backend container."
    echo ""
    echo "Options:"
    echo "  --rollback app_name migration_name   Roll back to a specific migration for the given app."
    echo "        Example: bb migrate --rollback myapp 0005_migration_name"
    echo ""
    echo "Without arguments, this command runs all migrations."
}

# Function for loaddata help
loaddata_help() {
    echo "Loaddata Help"
    echo "Usage: $0 loaddata filepath"
    echo "Description: Loads data from a specified fixture file path into the database."
}

# Function for app help
app_help() {
    echo "App Help:"
    echo "Usage: $0 app [app_name]"
    echo "Description: Creates a new Django app with the given name."
    echo "Example: $0 app users"
}

# Function for manage help
manage_help() {
    echo "Manage Help:"
    echo "Usage: $0 manage [command]"
    echo "Description: Execute Django management commands inside the backend container."
    echo "Example: $0 manage createsuperuser"
}

# Function to format duration in MM:SS format
format_duration() {
    local duration=$1
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))
    printf "%02d:%02d" $minutes $seconds
}

# Function to display test summary
display_test_summary() {
    echo -e "\n${BOLD}Test Summary:${NC}"

    local any_failures=false

    if [ "$run_django_tests" = true ]; then
        if [ $django_exit_code -eq 0 ]; then
            echo -e "${GREEN}✓ Django tests passed${NC} ($(format_duration $django_duration))"
        else
            echo -e "${RED}✗ Django tests failed${NC} ($(format_duration $django_duration))"
            any_failures=true
        fi
    fi

    if [ "$run_cypress_e2e_tests" = true ]; then
        if [ $cypress_e2e_exit_code -eq 0 ]; then
            echo -e "${GREEN}✓ Cypress E2E tests passed${NC} ($(format_duration $cypress_e2e_duration))"
        else
            echo -e "${RED}✗ Cypress E2E tests failed${NC} ($(format_duration $cypress_e2e_duration))"
            any_failures=true
        fi
    fi

    if [ "$run_cypress_component_tests" = true ]; then
        if [ $cypress_component_exit_code -eq 0 ]; then
            echo -e "${GREEN}✓ Cypress Component tests passed${NC} ($(format_duration $cypress_component_duration))"
        else
            echo -e "${RED}✗ Cypress Component tests failed${NC} ($(format_duration $cypress_component_duration))"
            any_failures=true
        fi
    fi

    if [ "$run_vitest_tests" = true ]; then
        if [ $vitest_exit_code -eq 0 ]; then
            echo -e "${GREEN}✓ Vitest tests passed${NC} ($(format_duration $vitest_duration))"
        else
            echo -e "${RED}✗ Vitest tests failed${NC} ($(format_duration $vitest_duration))"
            any_failures=true
        fi
    fi
}

# Check if at least one argument is provided
if [ $# -lt 1 ]; then
    usage
    exit 1
fi

workflow=$1
shift # This shifts the positional parameters to the left, so $2 becomes $1, $3 becomes $2, etc.

case $workflow in
    test)
        if [[ "$1" == "--help" ]]; then
            test_help
            exit 0
        fi

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
                    cypress_open_command="(cd client && npm run cypress:open)"
                    run_cypress_e2e_tests=false
                    run_cypress_component_tests=false
                    run_django_tests=false
                    run_vitest_tests=false
                    ;;
                *)
                    echo "Unknown argument: $1"
                    test_help
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
            if ! (cd client && npx cypress run --browser chrome --e2e); then
                cypress_e2e_exit_code=1
            fi
            cypress_e2e_duration=$((SECONDS - start_time))
        fi

        if [ "$run_cypress_component_tests" = true ]; then
            echo "Running Cypress Component tests..."
            start_time=$SECONDS
            if ! (cd client && npx cypress run --browser chrome --component); then
                cypress_component_exit_code=1
            fi
            cypress_component_duration=$((SECONDS - start_time))
        fi

        if [ "$run_vitest_tests" = true ]; then
            echo "Running Vitest tests..."
            start_time=$SECONDS
            if ! (cd client && npm run test:run); then
                vitest_exit_code=1
            fi
            vitest_duration=$((SECONDS - start_time))
        fi

        display_test_summary
        ;;
    clean)
        if [[ "$1" == "--help" ]]; then
            clean_help
            exit 0
        fi
        if [[ "$1" == "--data" ]]; then
            echo "Cleaning up data..."
            exec_backend python manage.py flush --noinput
            exec_backend python manage.py loaddata clean_data.yaml
        elif [[ "$1" == "--flush" ]]; then
            echo "Flushing the database..."
            exec_backend python manage.py flush --noinput
        else
            echo "Spinning up new instance..."
            docker compose down -v
            docker compose up -d --build
            exec_backend python manage.py migrate
            exec_backend python manage.py loaddata clean_data.yaml
        fi
        ;;
    flush-db)
        if [[ "$1" == "--help" ]]; then
            flush_db_help
            exit 0
        fi
        echo "Flushing the database..."
        exec_backend python manage.py flush --noinput
        ;;
    shell)
        if [[ "$1" == "--help" ]]; then
            shell_help
            exit 0
        fi
        echo "Entering Django shell..."
        exec_backend python manage.py shell
        ;;
    db)
        if [[ "$1" == "--help" ]]; then
            db_help
            exit 0
        fi
        echo "Entering Postgres shell..."
        exec_db psql -U postgres
        ;;
    coverage)
        if [[ "$1" == "--help" ]]; then
            coverage_help
            exit 0
        fi

        echo "Running coverage..."

        # Ensure coverage config exists
        if [ ! -f "/usr/src/backend/.coveragerc" ]; then
            echo "[run]
source = .
omit =
    */migrations/*
    */tests/*
    */env/*
    manage.py
    */asgi.py
    */wsgi.py
    */settings.py
    */urls.py
    */admin.py
    */apps.py" > /usr/src/backend/.coveragerc
        fi

        # Run tests with coverage
        exec_backend coverage run manage.py test

        # Generate reports based on flags
        report_generated=false
        while [[ $# -gt 0 ]]; do
            case $1 in
                --html)
                    exec_backend coverage html
                    echo "HTML report generated in htmlcov/"
                    report_generated=true
                    ;;
                --xml)
                    exec_backend coverage xml
                    echo "XML report generated in coverage.xml"
                    report_generated=true
                    ;;
            esac
            shift
        done

        # If no specific report format was requested, show console report
        if [ "$report_generated" = false ]; then
            exec_backend coverage report
        fi
        ;;
    quality)
        if [[ "$1" == "--help" ]]; then
            quality_help
            exit 0
        fi
        exec_backend flake8 .
        exec_backend black /usr/src/backend --exclude=/env/
#                                    black /usr/src/backend/ --exclude='/env/'

        exec_backend isort .
        exec_backend pytest -p no:warnings --cov=.
        ;;
    dumpdata)
        if [[ "$1" == "--help" ]]; then
            dumpdata_help
            exit 0
        fi
        output_file="default.yaml"
        if [[ -n "$1" ]]; then
            output_file="$1"
        fi
        exec_backend python manage.py dumpdata \
          --indent 4 \
          --natural-foreign \
          --natural-primary \
          -e auth.Permission \
          -e sessions \
          -e admin \
          -e contenttypes \
          --format yaml \
          ${@: 2} \
          > "$output_file"
        ;;
    loaddata)
        if [[ "$1" == "--help" ]]; then
            loaddata_help
            exit 0
        fi
        if [[ -z "$1" ]]; then
            echo "Error: You must provide a fixture file path."
            loaddata_help
            exit 1
        fi
        filepath=$1
        echo "Loading data from $filepath..."
        exec_backend python manage.py loaddata "$filepath"
        ;;
    makemigrations)
        if [[ "$1" == "--help" ]]; then
            makemigrations_help
            exit 0
        fi
        CMD="docker compose exec backend python manage.py makemigrations"
        if [[ "$1" == "--name" ]]; then
            CMD="$CMD --name $2"
        fi
        echo "Making migrations..."
        $CMD
        ;;
    migrate)
        if [[ "$1" == "--help" ]]; then
            migrate_help
            exit 0
        fi

        CMD="docker compose exec backend python manage.py migrate"

        if [[ "$1" == "--rollback" && -n "$2" && -n "$3" ]]; then
            # Roll back to a specific migration
            APP_NAME=$2
            MIGRATION_NAME=$3
            CMD="$CMD $APP_NAME $MIGRATION_NAME"
        elif [[ "$1" == "--rollback" && ( -z "$2" || -z "$3" ) ]]; then
            red_echo "Error: You must specify both the app name and migration name for rollback."
            exit 1
        fi
        echo "Running migrations..."
        $CMD
        ;;
    manage)
        if [[ "$1" == "--help" ]]; then
            manage_help
            exit 0
        fi
        exec_backend python manage.py "$@"
        ;;
    app)
        if [[ "$1" == "--help" ]]; then
            app_help
            exit 0
        fi
        if [ -z "$1" ]; then
            echo -e "${RED}Error: App name is required${NC}"
            app_help
            exit 1
        fi
        exec_backend python manage.py startapp "$1"
        echo -e "${GREEN}Successfully created Django app: $1${NC}"
        echo -e "${BOLD}Remember to:${NC}"
        echo "1. Add '$1' to INSTALLED_APPS in settings.py"
        echo "2. Create your models in $1/models.py"
        echo "3. Register your models in $1/admin.py"
        ;;
    *)
        echo "Unknown workflow: $workflow"
        usage
        exit 2
        ;;
esac
