#!/bin/bash
# Core framework for bb tool

# Determine the bb.d directory location
# This works whether bb is a symlink or called directly
if [ -L "$0" ]; then
    BB_SCRIPT=$(readlink "$0")
else
    BB_SCRIPT="$0"
fi
BB_DIR="$(cd "$(dirname "$BB_SCRIPT")" && pwd)"
BB_D_DIR="${BB_DIR}/bb.d"

# Load shared libraries
source "${BB_D_DIR}/lib/colors.sh"
source "${BB_D_DIR}/lib/docker.sh"
source "${BB_D_DIR}/lib/formatters.sh"

# Function to display general usage
usage() {
    echo "General Usage: bb workflow_name [additional_args]"
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
    echo "  db             - Enters the user into a Postgres shell inside the db container."
    echo "  coverage       - Runs a coverage report for the Django test suite."
    echo "  quality        - Runs flake8, black, and isort."
    echo "  dumpdata       - Dumps the data from the database into a YAML file (default: default.yaml)."
    echo "                   - Accepts an optional output file name as an argument."
    echo "  loaddata       - Loads data from a given file path into the database."
    echo "  makemigrations - Makes migrations for the database."
    echo "  migrate        - Runs Django migrations inside the backend container."
    echo "  app            - Creates a new Django app with the given name."
    echo "  manage         - Execute Django management commands inside the backend container."
    echo "Use 'bb workflow_name --help' for more information on a specific workflow."
}

# Function to load and execute a command
execute_command() {
    local command_name="$1"
    shift

    local command_file="${BB_D_DIR}/commands/${command_name}.sh"

    if [ ! -f "$command_file" ]; then
        echo "Unknown workflow: $command_name"
        usage
        exit 2
    fi

    # Source the command file
    source "$command_file"

    # Check for --help flag
    if [[ "$1" == "--help" ]]; then
        command_${command_name}_help
        exit 0
    fi

    # Execute the command
    command_${command_name}_run "$@"
}

# Main entry point
if [ $# -lt 1 ]; then
    usage
    exit 1
fi

workflow=$1
shift

execute_command "$workflow" "$@"
