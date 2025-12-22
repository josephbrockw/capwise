---
sidebar_position: 2
---

# BB CLI Tool

The `bb` command is a development helper tool that provides shortcuts for common tasks. It's installed automatically by `dev_setup.sh` or can be installed manually.

## Installation

The CLI tool is installed during setup:

```bash
./dev_setup.sh
```

Or manually:

```bash
chmod +x bb.sh
sudo cp bb.sh /usr/local/bin/bb
sudo cp -r bb.d /usr/local/bin/bb.d
```

## Architecture

The CLI is built with a modular architecture:

```
bb.d/
├── core.sh              # Core framework (command loading & dispatch)
├── lib/                 # Shared utilities
│   ├── colors.sh        # Color definitions & output helpers
│   ├── docker.sh        # exec_backend, exec_db helpers
│   ├── formatters.sh    # format_duration, display_test_summary
│   └── config.sh        # Configuration file parser (basebuild.toml)
└── commands/            # Individual command modules
    ├── test.sh          # Test command
    ├── clean.sh         # Clean command
    ├── shell.sh         # Shell command
    └── ...              # Other commands
```

## Available Commands

### Testing

```bash
# Run all tests for enabled services
bb test

# Run tests for a specific service
bb test django      # Django tests only
bb test next        # Next.js tests (Vitest + Playwright)
bb test react       # React/Cypress tests

# Run with coverage
bb coverage
```

### Database

```bash
# Open database shell
bb db

# Run migrations
bb migrate

# Create new migrations
bb makemigrations

# Dump data to JSON
bb dumpdata [app_label]

# Load data from JSON
bb loaddata [fixture_file]
```

### Django Management

```bash
# Open Django shell
bb shell

# Run any Django management command
bb manage [command] [args]

# Examples:
bb manage createsuperuser
bb manage collectstatic
```

### Docker & Services

```bash
# View logs
bb logs                 # All services
bb logs django          # Specific service
bb logs -f              # Follow logs

# Stop all services
bb stop

# Clean up Docker resources
bb clean                # Standard cleanup
bb clean --volumes      # Include volumes
bb clean --all          # Full cleanup
```

### Configuration

```bash
# View current configuration
bb config

# List enabled services
bb config --services
```

### Code Quality

```bash
# Run linters and formatters
bb quality
```

### Sync

```bash
# Sync dependencies and rebuild
bb sync
```

## Command Reference

| Command | Description |
|---------|-------------|
| `bb test [service]` | Run tests for all or specific service |
| `bb coverage` | Run tests with coverage report |
| `bb shell` | Open Django interactive shell |
| `bb db` | Open PostgreSQL shell |
| `bb migrate` | Run Django migrations |
| `bb makemigrations` | Create new Django migrations |
| `bb manage [cmd]` | Run Django management command |
| `bb logs [service]` | View service logs |
| `bb stop` | Stop all Docker services |
| `bb clean` | Clean up Docker resources |
| `bb config` | Show configuration |
| `bb quality` | Run code quality checks |
| `bb sync` | Sync and rebuild services |
| `bb dumpdata` | Export database data |
| `bb loaddata` | Import database data |
| `bb app` | Mobile app commands |

## Getting Help

```bash
# Show available commands
bb --help
bb help

# Show help for specific command
bb test --help
bb clean --help
```

## Adding Custom Commands

You can extend the CLI by adding new command files to `bb.d/commands/`:

1. Create a new file in `bb.d/commands/` named `yourcommand.sh`
2. Implement two required functions:

```bash
#!/bin/bash
# Description of your command

command_yourcommand_help() {
    echo "Your Command Help:"
    echo "Usage: bb yourcommand [options]"
    echo "Description: What your command does."
}

command_yourcommand_run() {
    # Your command implementation
    echo "Running your command..."
    exec_backend python manage.py yourcommand "$@"
}
```

3. Reinstall the CLI to pick up changes:

```bash
sudo cp -r bb.d /usr/local/bin/bb.d
```

The command will be automatically available as `bb yourcommand`.

## Shared Libraries

Commands have access to shared utilities:

### Colors

```bash
echo "${GREEN}Success${NC}"
echo "${RED}Error${NC}"
echo "${BOLD}Important${NC}"
```

### Docker Helpers

```bash
# Execute command in Django container
exec_backend python manage.py shell

# Execute command in database container
exec_db psql -U admin db_dev
```

### Configuration

```bash
# Check if a service is enabled in basebuild.toml
if is_service_enabled "next"; then
    echo "Next.js is enabled"
fi

# Get list of enabled services
services=$(get_enabled_services)
```

## Troubleshooting

### Command Not Found

If `bb` is not found after installation:

```bash
# Check if it's in PATH
which bb

# Reinstall
sudo cp bb.sh /usr/local/bin/bb
sudo cp -r bb.d /usr/local/bin/bb.d
```

### Permission Denied

```bash
sudo chmod +x /usr/local/bin/bb
sudo chmod -R +x /usr/local/bin/bb.d
```

### Commands Not Loading

Ensure the `bb.d` directory was copied:

```bash
ls /usr/local/bin/bb.d/commands/
```

If empty, reinstall:

```bash
sudo rm -rf /usr/local/bin/bb.d
sudo cp -r bb.d /usr/local/bin/bb.d
```
