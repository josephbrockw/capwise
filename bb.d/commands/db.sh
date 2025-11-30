#!/bin/bash
# Database shell command

command_db_help() {
    echo "DB Shell Help:"
    echo "Usage: bb db [options]"
    echo "Description: Enter into a Postgres shell inside the db container."
}

command_db_run() {
    echo "Entering Postgres shell..."
    exec_db psql -U postgres
}
