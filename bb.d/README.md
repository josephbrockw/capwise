# BB Tool - Modular Architecture

This directory contains the modular implementation of the `bb` CLI tool.

## Structure

```
bb.d/
├── core.sh              # Core framework (command loading & dispatch)
├── lib/                 # Shared utilities
│   ├── colors.sh        # Color definitions & output helpers
│   ├── docker.sh        # exec_backend, exec_db helpers
│   └── formatters.sh    # format_duration, display_test_summary
└── commands/            # Individual command modules
    ├── test.sh          # Test command
    ├── clean.sh         # Clean command
    ├── shell.sh         # Shell command
    ├── db.sh            # DB command
    ├── coverage.sh      # Coverage command
    ├── quality.sh       # Quality command
    ├── dumpdata.sh      # Dumpdata command
    ├── loaddata.sh      # Loaddata command
    ├── makemigrations.sh # Makemigrations command
    ├── migrate.sh       # Migrate command
    ├── manage.sh        # Manage command
    └── app.sh           # App command
```

## Adding a New Command

1. Create a new file in `bb.d/commands/` named `yourcommand.sh`
2. Implement two required functions:
   - `command_yourcommand_help()` - Displays help text
   - `command_yourcommand_run()` - Executes the command logic
3. The command will be automatically available as `bb yourcommand`

### Example Command File

```bash
#!/bin/bash
# Your command description

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

## Shared Libraries

All commands have access to:
- **Colors**: `$GREEN`, `$RED`, `$NC`, `$BOLD`
- **Docker helpers**: `exec_backend()`, `exec_db()`
- **Formatters**: `format_duration()`, `display_test_summary()`
- **Test state**: `django_exit_code`, `cypress_e2e_exit_code`, etc.

## Installation

Run `./dev_setup.sh` to install both `bb` and the `bb.d/` directory to `/usr/local/bin/`.

## Maintenance

- **Edit a command**: Modify the appropriate file in `bb.d/commands/`
- **Edit shared utilities**: Modify files in `bb.d/lib/`
- **Reinstall**: Run `./dev_setup.sh` to copy changes to `/usr/local/bin/`
