#!/bin/bash
# Code quality command

command_quality_help() {
    echo "Quality Help"
    echo "Usage: bb quality [options]"
    echo "Description: Runs flake8, black, and isort."
}

command_quality_run() {
    exec_backend flake8 .
    exec_backend black /usr/src/backend --exclude=/env/
    exec_backend isort .
    exec_backend pytest -p no:warnings --cov=.
}
