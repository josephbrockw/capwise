#!/bin/bash
# Clean command

command_clean_help() {
    echo "Clean Help:"
    echo "Usage: bb clean [options]"
    echo "Description: Tears down the docker containers and builds new ones running"
    echo "in detached mode. Only starts services enabled in basebuild.toml."
    echo "Next.js runs in a tmux session (use 'bb logs next' to view)."
    echo ""
    echo "Options:"
    echo "  --data    Flush database and reload clean_data.yaml (requires Django)"
    echo "  --flush   Flush database only (requires Django)"
}

command_clean_run() {
    if [[ "$1" == "--data" ]]; then
        if ! is_service_enabled "django"; then
            echo -e "${RED}Error: Django service is disabled in basebuild.toml${NC}"
            exit 1
        fi
        echo "Cleaning up data..."
        exec_backend python manage.py flush --noinput
        exec_backend python manage.py loaddata clean_data.yaml
    elif [[ "$1" == "--flush" ]]; then
        if ! is_service_enabled "django"; then
            echo -e "${RED}Error: Django service is disabled in basebuild.toml${NC}"
            exit 1
        fi
        echo "Flushing the database..."
        exec_backend python manage.py flush --noinput
    else
        echo "Spinning up new instance..."
        local services=$(get_enabled_services)
        echo "Enabled services: $services"

        # Set WAIT_FOR_BROKER based on broker service status
        if is_service_enabled "broker"; then
            export WAIT_FOR_BROKER=true
        else
            export WAIT_FOR_BROKER=false
        fi

        docker compose down -v
        docker compose up -d --build $services

        if is_service_enabled "django"; then
            exec_backend python manage.py migrate
            exec_backend python manage.py loaddata clean_data.yaml
        fi

        # Start Next.js in tmux session if enabled
        if is_service_enabled "next"; then
            if ! command -v tmux &>/dev/null; then
                echo -e "${RED}Error: tmux is not installed${NC}"
                echo "Install it with: brew install tmux"
                echo "Then run 'bb clean' again to start Next.js"
            else
                # Kill existing session if it exists
                tmux kill-session -t next 2>/dev/null

                echo "Starting Next.js in tmux session 'next'..."
                tmux new-session -d -s next -c "${PROJECT_ROOT}/next" "npm run dev -- -p 3002"
                echo -e "${GREEN}Next.js started in tmux session 'next'${NC}"
                echo "  View logs: bb logs next"
                echo "  Attach:    tmux attach -t next"
            fi
        fi
    fi
}
