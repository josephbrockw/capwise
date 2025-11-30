#!/bin/bash
# Docker helper functions

exec_backend() {
    docker compose exec backend "$@"
}

exec_db() {
    docker compose exec db "$@"
}
