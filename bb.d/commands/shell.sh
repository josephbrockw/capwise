#!/bin/bash
# Django shell command

command_shell_help() {
    echo "Shell Help:"
    echo "Usage: bb shell [options]"
    echo "Description: Enter into a Django shell inside the backend container."
    echo "Note: Requires Django service to be enabled in basebuild.toml."
}

command_shell_run() {
    # Check if Django service is enabled
    if ! is_service_enabled "django"; then
        echo -e "${RED}Error: Django service is disabled in basebuild.toml${NC}"
        echo "Enable it by setting: django = true"
        exit 1
    fi

    echo "Entering Django shell..."
    exec_backend python manage.py shell
}
