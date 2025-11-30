#!/bin/bash
# Make migrations command

command_makemigrations_help() {
    echo "Make Migrations Help"
    echo "Usage: bb makemigrations"
    echo "Description: Makes migrations for the database."
}

command_makemigrations_run() {
    CMD="docker compose exec backend python manage.py makemigrations"
    if [[ "$1" == "--name" ]]; then
        CMD="$CMD --name $2"
    fi
    echo "Making migrations..."
    $CMD
}
