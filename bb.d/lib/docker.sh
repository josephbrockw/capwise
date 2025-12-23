#!/bin/bash
# Docker helper functions

# Get docker compose command with profile flags
# Usage: $(compose_cmd) up -d
compose_cmd() {
    local profiles=$(get_compose_profiles)
    echo "docker compose $profiles"
}

# Execute command in backend container with profiles
exec_backend() {
    local profiles=$(get_compose_profiles)
    docker compose $profiles exec backend "$@"
}

# Execute command in db container with profiles
exec_db() {
    local profiles=$(get_compose_profiles)
    docker compose $profiles exec db "$@"
}
