#!/bin/bash
# Load data command

command_loaddata_help() {
    echo "Loaddata Help"
    echo "Usage: bb loaddata filepath"
    echo "Description: Loads data from a specified fixture file path into the database."
}

command_loaddata_run() {
    if [[ -z "$1" ]]; then
        echo "Error: You must provide a fixture file path."
        command_loaddata_help
        exit 1
    fi
    filepath=$1
    echo "Loading data from $filepath..."
    exec_backend python manage.py loaddata "$filepath"
}
