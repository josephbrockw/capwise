#!/bin/bash
# Configuration management command

command_config_help() {
    echo "Config Help:"
    echo "Usage: bb config [options]"
    echo "Description: View and manage project configuration"
    echo ""
    echo "Options:"
    echo "  show              Display current configuration (default)"
    echo "  services          List enabled services"
    echo "  validate          Check basebuild.toml for valid TOML syntax"
    echo ""
    echo "Examples:"
    echo "  bb config              # Show current configuration"
    echo "  bb config show         # Show current configuration"
    echo "  bb config services     # List enabled services"
    echo "  bb config validate     # Validate TOML syntax"
}

command_config_run() {
    local action="${1:-show}"

    case "$action" in
        show)
            show_config
            ;;
        services)
            echo -e "${BOLD}Enabled Services:${NC}"
            local services=($(get_enabled_services))
            for service in "${services[@]}"; do
                echo -e "  ${GREEN}✓${NC} $service"
            done
            ;;
        validate)
            if config_exists; then
                # Try to parse the config
                python3 -c "
import sys
try:
    import tomllib
except ImportError:
    try:
        import tomli as tomllib
    except ImportError:
        print('Warning: tomllib/tomli not available, cannot validate')
        sys.exit(0)

try:
    with open('$CONFIG_FILE', 'rb') as f:
        config = tomllib.load(f)
    print('✓ Configuration file is valid')
    sys.exit(0)
except Exception as e:
    print(f'✗ Configuration file is invalid: {e}')
    sys.exit(1)
" 2>&1
                exit_code=$?
                if [ $exit_code -eq 0 ]; then
                    echo -e "${GREEN}Configuration is valid${NC}"
                else
                    echo -e "${RED}Configuration has errors${NC}"
                    exit 1
                fi
            else
                echo -e "${RED}Error: Configuration file not found at $CONFIG_FILE${NC}"
                exit 1
            fi
            ;;
        *)
            echo -e "${RED}Unknown action: $action${NC}"
            command_config_help
            exit 1
            ;;
    esac
}
