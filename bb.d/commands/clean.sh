#!/bin/bash
# Clean command

command_clean_help() {
    echo "Clean Help:"
    echo "Usage: bb clean [options]"
    echo "Description: Tears down the docker containers and builds new ones running"
    echo "in detached mode."
}

command_clean_run() {
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
}
