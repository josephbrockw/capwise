#!/bin/bash
# Django manage command

command_manage_help() {
    echo "Manage Help:"
    echo "Usage: bb manage [command]"
    echo "Description: Execute Django management commands inside the backend container."
    echo "Example: bb manage createsuperuser"
}

command_manage_run() {
    exec_backend python manage.py "$@"
}
