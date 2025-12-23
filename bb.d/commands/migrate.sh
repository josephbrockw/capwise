#!/bin/bash
# Migrate command

command_migrate_help() {
    echo "Usage: bb migrate [--rollback app_name migration_name]"
    echo ""
    echo "Runs Django migrations inside the backend container."
    echo "Note: Requires Django service to be enabled in basebuild.toml."
    echo ""
    echo "Options:"
    echo "  --rollback app_name migration_name   Roll back to a specific migration for the given app."
    echo "        Example: bb migrate --rollback myapp 0005_migration_name"
    echo ""
    echo "Without arguments, this command runs all migrations."
}

command_migrate_run() {
    # Check if Django service is enabled
    if ! is_service_enabled "django"; then
        echo -e "${RED}Error: Django service is disabled in basebuild.toml${NC}"
        echo "Enable it by setting: django = true"
        exit 1
    fi

    local profiles=$(get_compose_profiles)
    CMD="docker compose $profiles exec backend python manage.py migrate"

    if [[ "$1" == "--rollback" && -n "$2" && -n "$3" ]]; then
        # Roll back to a specific migration
        APP_NAME=$2
        MIGRATION_NAME=$3
        CMD="$CMD $APP_NAME $MIGRATION_NAME"
    elif [[ "$1" == "--rollback" && ( -z "$2" || -z "$3" ) ]]; then
        echo -e "${RED}Error: You must specify both the app name and migration name for rollback.${NC}"
        exit 1
    fi
    echo "Running migrations..."
    $CMD
}
