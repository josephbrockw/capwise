#!/bin/bash
# Django manage command

command_manage_help() {
    echo "Manage Help:"
    echo "Usage: bb manage [command]"
    echo "Description: Execute Django management commands inside the backend container."
    echo "Note: Requires Django service to be enabled in basebuild.toml."
    echo "Example: bb manage createsuperuser"
}

command_manage_run() {
    # Check if Django service is enabled
    if ! is_service_enabled "django"; then
        echo -e "${RED}Error: Django service is disabled in basebuild.toml${NC}"
        echo "Enable it by setting: django = true"
        exit 1
    fi

    exec_backend python manage.py "$@"
}
