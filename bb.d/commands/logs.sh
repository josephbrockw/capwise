#!/bin/bash
# Logs command

command_logs_help() {
    echo "Logs Help:"
    echo "Usage: bb logs [service]"
    echo "Description: View logs for a service."
    echo ""
    echo "Services:"
    echo "  next       View Next.js logs (attaches to tmux session)"
    echo "  backend    View Django backend logs"
    echo "  celery     View Celery worker logs"
    echo ""
    echo "Options:"
    echo "  --follow, -f    Follow log output (Docker services only)"
}

command_logs_run() {
    local service="$1"
    shift
    local follow=""

    # Check for follow flag
    for arg in "$@"; do
        case $arg in
            -f|--follow)
                follow="-f"
                ;;
        esac
    done

    case "$service" in
        next)
            if ! is_service_enabled "next"; then
                echo -e "${RED}Error: Next.js service is disabled in basebuild.toml${NC}"
                exit 1
            fi
            if tmux has-session -t next 2>/dev/null; then
                echo "Attaching to Next.js tmux session (Ctrl+B, D to detach)..."
                tmux attach -t next
            else
                echo -e "${RED}Error: Next.js tmux session not found${NC}"
                echo "Start it with: bb clean"
                exit 1
            fi
            ;;
        backend)
            if ! is_service_enabled "django"; then
                echo -e "${RED}Error: Django service is disabled in basebuild.toml${NC}"
                exit 1
            fi
            docker compose logs $follow backend
            ;;
        celery)
            if ! is_service_enabled "celery_django"; then
                echo -e "${RED}Error: Celery service is disabled in basebuild.toml${NC}"
                exit 1
            fi
            docker compose logs $follow celery
            ;;
        "")
            echo -e "${RED}Error: Please specify a service${NC}"
            command_logs_help
            exit 1
            ;;
        *)
            echo -e "${RED}Error: Unknown service '$service'${NC}"
            command_logs_help
            exit 1
            ;;
    esac
}
