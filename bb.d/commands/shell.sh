#!/bin/bash
# Django shell command

command_shell_help() {
    echo "Shell Help:"
    echo "Usage: bb shell [options]"
    echo "Description: Enter into a Django shell inside the backend container."
}

command_shell_run() {
    echo "Entering Django shell..."
    exec_backend python manage.py shell
}
