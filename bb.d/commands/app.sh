#!/bin/bash
# Django app creation command

command_app_help() {
    echo "App Help:"
    echo "Usage: bb app [app_name]"
    echo "Description: Creates a new Django app with the given name."
    echo "Example: bb app users"
}

command_app_run() {
    if [ -z "$1" ]; then
        echo -e "${RED}Error: App name is required${NC}"
        command_app_help
        exit 1
    fi
    exec_backend python manage.py startapp "$1"
    echo -e "${GREEN}Successfully created Django app: $1${NC}"
    echo -e "${BOLD}Remember to:${NC}"
    echo "1. Add '$1' to INSTALLED_APPS in settings.py"
    echo "2. Create your models in $1/models.py"
    echo "3. Register your models in $1/admin.py"
}
