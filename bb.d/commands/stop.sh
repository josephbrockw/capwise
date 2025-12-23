#!/bin/bash
# Stop command

command_stop_help() {
    echo "Stop Help:"
    echo "Usage: bb stop [service]"
    echo "Description: Stop running services. Stops all services by default."
    echo ""
    echo "Services:"
    echo "  (none)     Stop everything (default)"
    echo "  next       Stop Next.js tmux session only"
    echo "  docker     Stop Docker containers only"
}

command_stop_run() {
    local target="$1"

    case "$target" in
        next)
            if tmux has-session -t next 2>/dev/null; then
                echo "Stopping Next.js..."
                tmux kill-session -t next
                echo -e "${GREEN}Next.js stopped${NC}"
            else
                echo "Next.js is not running"
            fi
            ;;
        docker)
            echo "Stopping Docker containers..."
            local profiles=$(get_compose_profiles)
            docker compose $profiles down
            echo -e "${GREEN}Docker containers stopped${NC}"
            ;;
        ""|--all)
            echo "Stopping all services..."
            # Stop Next.js
            if tmux has-session -t next 2>/dev/null; then
                echo "Stopping Next.js..."
                tmux kill-session -t next
            fi
            # Stop Docker
            echo "Stopping Docker containers..."
            local profiles=$(get_compose_profiles)
            docker compose $profiles down
            echo -e "${GREEN}All services stopped${NC}"
            ;;
        *)
            echo -e "${RED}Error: Unknown target '$target'${NC}"
            command_stop_help
            exit 1
            ;;
    esac
}
