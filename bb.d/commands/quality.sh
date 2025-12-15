#!/bin/bash
# Code quality command

command_quality_help() {
    echo "Quality Help"
    echo "Usage: bb quality [options]"
    echo "Description: Runs flake8, black, and isort."
    echo "Note: Requires Django service to be enabled in basebuild.toml."
}

command_quality_run() {
    # Check if Django service is enabled
    if ! is_service_enabled "django"; then
        echo -e "${RED}Error: Django service is disabled in basebuild.toml${NC}"
        echo "Enable it by setting: django = true"
        exit 1
    fi

    exec_backend flake8 .
    exec_backend black /usr/src/backend --exclude=/env/
    exec_backend isort .
    exec_backend pytest -p no:warnings --cov=.
}
