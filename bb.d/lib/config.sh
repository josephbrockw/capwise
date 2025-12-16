#!/bin/bash
# Configuration file parser for basebuild.toml

# Use current working directory as project root (where bb command is run from)
# This allows the installed bb command to find basebuild.toml in the project
PROJECT_ROOT="$(pwd)"
CONFIG_FILE="${PROJECT_ROOT}/basebuild.toml"

# Check if a service is enabled (returns true/false)
is_service_enabled() {
    local service="$1"

    # If no config file, all services enabled by default
    [ ! -f "$CONFIG_FILE" ] && return 0

    # Read boolean value from TOML
    local result=$(python3 -c "
try:
    import tomllib
except ImportError:
    try:
        import tomli as tomllib
    except:
        print('true')
        exit()

try:
    with open('$CONFIG_FILE', 'rb') as f:
        config = tomllib.load(f)
    value = config.get('services', {}).get('$service', True)
    print(str(value).lower())
except:
    print('true')
" 2>/dev/null)

    [ "$result" = "true" ]
}

# Get list of enabled services for docker-compose
get_enabled_services() {
    local services=()

    # Django backend (includes database)
    if is_service_enabled "django"; then
        services+=("db")
        services+=("backend")
    fi

    # React frontend
    if is_service_enabled "react"; then
        services+=("frontend")
    fi

    # Note: Next.js runs outside Docker via tmux, not as a Docker service

    # Broker
    if is_service_enabled "broker"; then
        services+=("broker")
    fi

    # Django Celery worker
    if is_service_enabled "celery_django"; then
        services+=("celery")
    fi

    # Independent Celery worker
    if is_service_enabled "celery_worker"; then
        services+=("celery2")
    fi

    # Flower
    if is_service_enabled "flower"; then
        services+=("flower")
    fi

    # Docs
    if is_service_enabled "docs"; then
        services+=("docs")
    fi

    # Mobile
    if is_service_enabled "mobile"; then
        services+=("native-app")
    fi

    echo "${services[@]}"
}

# Helper function to check if we should run an operation for a service
# Usage: should_run_for_service "service_name" "$flag_variable"
# Returns: 0 (true) if both the service is enabled and the flag is true
should_run_for_service() {
    local service="$1"
    local flag="$2"

    if [ "$flag" = true ] && is_service_enabled "$service"; then
        return 0
    else
        return 1
    fi
}

# Get active status for a service (returns "true" or "false" as string)
# Usage: react_active=$(get_service_status "react")
get_service_status() {
    local service="$1"
    if is_service_enabled "$service"; then
        echo "true"
    else
        echo "false"
    fi
}

# Display current configuration summary
show_config() {
    echo -e "${BOLD}Enabled Services:${NC}"
    echo ""
    echo -e "${GREEN}Core:${NC}"
    is_service_enabled "django" && echo "  ✓ Django" || echo "  ✗ Django"
    is_service_enabled "react" && echo "  ✓ React" || echo "  ✗ React"
    is_service_enabled "next" && echo "  ✓ Next.js" || echo "  ✗ Next.js"
    echo ""
    echo -e "${GREEN}Workers:${NC}"
    is_service_enabled "celery_django" && echo "  ✓ Django Celery" || echo "  ✗ Django Celery"
    is_service_enabled "celery_worker" && echo "  ✓ Independent Worker" || echo "  ✗ Independent Worker"
    is_service_enabled "broker" && echo "  ✓ Broker" || echo "  ✗ Broker"
    is_service_enabled "flower" && echo "  ✓ Flower" || echo "  ✗ Flower"
    echo ""
    echo -e "${GREEN}Optional:${NC}"
    is_service_enabled "docs" && echo "  ✓ Docs" || echo "  ✗ Docs"
    is_service_enabled "mobile" && echo "  ✓ Mobile" || echo "  ✗ Mobile"
}
