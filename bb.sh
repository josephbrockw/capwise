#!/bin/bash

# Function to display general usage
usage() {
    echo "General Usage: $0 workflow_name [additional_args]"
    echo "Available workflows:"
    echo "  test      - Run the test suite."
    echo "                - Accepts optional '--type=testtype' argument."
    echo "                - Accepts optional '--k=keyword' argument."
    echo "  cypress   - Run the cypress tests."
    echo "  full-test - Run the test suite, flush the db, and run the cypress tests."
    echo "  clean     - Shuts down docker containers and rebuilds new ones."
    echo "  shell     - Enters the user into a Flask shell inside the app container."
    echo "  psql      - Enters the user into a Postgres shell inside the db container."
    echo "  coverage  - Runs a coverage report for the full test suite."
    echo "  quality   - Runs flake8, black, and isort, then runs a coverage report."
    echo "  dumpdata  - Dumps the data from the database into a yaml file called default.yaml by default."
    echo "                - Accepts optional output file name as argument."
    echo "  loaddata    - Loads data from a given file path into the database."
    echo "  makemigrations - Makes migrations for the database."
    echo "  migrate   - Runs Django migrations inside the backend container."
    echo "Use '$0 workflow_name --help' for more information on a specific workflow"
}

# Function for testing help
test_help() {
    echo "Test Help:"
    echo "Usage: $0 workflow1 [--type=test_type]"
    echo "Description: Runs the pytest test suite."
    echo "Options:"
    echo "   --type=testtype: Runs functional or unit tests in isolation."
    echo "   --k=keyword: Runs test matching a keyword in the name."
}

# Function for cypress help
cypress_help() {
    echo "Cypress Help:"
    echo "Usage: $0 cypress"
    echo "Description: Runs the cypress tests."
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
    echo "Usage: $0 coverage [--html]"
    echo "Description: Runs a coverage report for the full test suite"
    echo ""
    echo "Options:"
    echo "  --html   Generate an HTML report."
}

quality_help() {
    echo "Quality Help"
    echo "Usage: $0 quality [options]"
    echo "Description: Runs flake8, black, and isort before running a coverage report for the full test suite"
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

# Check if at least one argument is provided
if [ $# -lt 1 ]; then
    usage
    exit 1
fi

workflow=$1
shift # This shifts the positional parameters to the left, so $2 becomes $1, $3 becomes $2, etc.

case $workflow in
    test)
        command="docker compose exec backend pytest"
        for arg in "$@"; do
            if [[ "$arg" == "--help" ]]; then
                test_help
                exit 0
            elif [[ "$arg" =~ ^--type= ]]; then
                type="${arg#*=}"
            elif [[ "$arg" =~ ^--k= ]]; then
                k=" -k ${arg#*=}"
            elif [[ "$arg" == "-s" ]]; then
                command+=" -s"
            fi
        done

        if [[ -n $type ]]; then
            command+="/$type"
        fi
        if [[ -n $k ]]; then
            command+="$k"
        fi

        echo "Running tests..."
        echo "$command"
        eval "$command"
        ;;
    cypress)
        if [[ "$1" == "--help" ]]; then
            cypress_help
            exit 0
        fi
        docker compose exec backend python manage.py flush --noinput
        echo "Database flushed. Running cypress tests..."
        (cd client && npm run cypress:open)
        ;;
    full-test)
        if [[ "$1" == "--help" ]]; then
            full_test_help
            exit 0
        fi
        echo "Running pytest..."
        docker compose exec backend pytest
        docker compose exec backend python manage.py flush --noinput
        echo "Database flushed."
        (cd client && npm run cypress:run --browser chrome)
        docker compose exec backend python manage.py flush --noinput
        docker compose exec backend python manage.py loaddata clean_data.yaml
       ;;
    clean)
        if [[ "$1" == "--help" ]]; then
            clean_help
            exit 0
        fi
        echo "Spinning up new instance..."
        docker compose down -v
        docker compose up -d --build
        docker compose exec backend python manage.py migrate
        docker compose exec backend python manage.py loaddata clean_data.yaml
        ;;
    flush-db)
        if [[ "$1" == "--help" ]]; then
            flush_db_help
            exit 0
        fi
        echo "Flushing the database..."
        docker compose exec backend python manage.py flush --noinput
        ;;
    shell)
        if [[ "$1" == "--help" ]]; then
            shell_help
            exit 0
        fi
        echo "Entering Django shell..."
        docker compose exec backend python manage.py shell
        ;;
    db)
        if [[ "$1" == "--help" ]]; then
            db_help
            exit 0
        fi
        echo "Entering Postgres shell..."
        docker compose exec db_dev psql -U postgres
        ;;
    coverage)
        if [[ "$1" == "--help" ]]; then
            coverage_help
            exit 0
        fi

        command="docker compose exec backend pytest -p no:warnings --cov=."

        # Check if the user wants an HTML report
        if [[ "$1" == "--html" ]]; then
            command+=" --cov-report=html"
        fi

        echo "Running coverage..."
        eval "$command"

        if [[ "$1" == "--html" ]]; then
            echo "Coverage HTML report generated. You can view it at 'htmlcov/index.html'."
        fi
        ;;
    quality)
        if [[ "$1" == "--help" ]]; then
            quality_help
            exit 0
        fi
        docker compose exec backend flake8 .
        docker compose exec backend black /usr/src/backend --exclude=/env/
#                                    black /usr/src/backend/ --exclude='/env/'

        docker compose exec backend isort .
        docker compose exec backend pytest -p no:warnings --cov=.
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
        docker compose exec backend python manage.py dumpdata \
          --indent 4 \
          --natural-foreign \
          --natural-primary \
          -e auth.Permission \
          -e sessions \
          -e admin \
          -e contenttypes \
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
        docker compose exec backend python manage.py loaddata "$filepath"
        ;;
    makemigrations)
        if [[ "$1" == "--help" ]]; then
            makemigrations_help
            exit 0
        fi
        CMD="docker compose exec backend python manage.py makemigrations"
        if [[ "$1" == "--name" ]]; then
            CMD"$CMD --name $2"
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
    *)
        echo "Unknown workflow: $workflow"
        usage
        exit 2
        ;;
esac
