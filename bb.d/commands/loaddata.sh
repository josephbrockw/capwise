#!/bin/bash
# Load data command

command_loaddata_help() {
    echo "Loaddata Help"
    echo "Usage: bb loaddata filepath"
    echo "Description: Loads data from a specified fixture file path into the database."
    echo "Note: Requires Django service to be enabled in basebuild.toml."
}

command_loaddata_run() {
    # Check if Django service is enabled
    if ! is_service_enabled "django"; then
        echo -e "${RED}Error: Django service is disabled in basebuild.toml${NC}"
        echo "Enable it by setting: django = true"
        exit 1
    fi

    if [[ -z "$1" ]]; then
        echo "Error: You must provide a fixture file path."
        command_loaddata_help
        exit 1
    fi
    filepath=$1
    echo "Loading data from $filepath..."
    exec_backend python manage.py loaddata "$filepath"
}
