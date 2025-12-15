#!/bin/bash
# Database shell command

command_db_help() {
    echo "DB Shell Help:"
    echo "Usage: bb db [options]"
    echo "Description: Enter into a Postgres shell inside the db container."
    echo "Note: Requires Django service to be enabled in basebuild.toml."
}

command_db_run() {
    # Check if Django service is enabled (requires database)
    if ! is_service_enabled "django"; then
        echo -e "${RED}Error: Django service is disabled in basebuild.toml${NC}"
        echo "Enable it by setting: django = true"
        exit 1
    fi

    echo "Entering Postgres shell..."
    exec_db psql -U postgres
}
