#!/bin/bash
# Make migrations command

command_makemigrations_help() {
    echo "Make Migrations Help"
    echo "Usage: bb makemigrations"
    echo "Description: Makes migrations for the database."
    echo "Note: Requires Django service to be enabled in basebuild.toml."
}

command_makemigrations_run() {
    # Check if Django service is enabled
    if ! is_service_enabled "django"; then
        echo -e "${RED}Error: Django service is disabled in basebuild.toml${NC}"
        echo "Enable it by setting: django = true"
        exit 1
    fi

    local profiles=$(get_compose_profiles)
    CMD="docker compose $profiles exec backend python manage.py makemigrations"
    if [[ "$1" == "--name" ]]; then
        CMD="$CMD --name $2"
    fi
    echo "Making migrations..."
    $CMD
}
