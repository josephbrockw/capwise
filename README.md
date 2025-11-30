# BaseBuild

## BB CLI Tool

BaseBuild includes a powerful command-line tool (`bb`) that simplifies common development workflows. The tool features a modular architecture that makes it easy to maintain and extend.

### Installation

Run the development setup script to install the `bb` command globally:

```bash
./dev_setup.sh
```

This installs both the `bb` executable and its modular framework (`bb.d/`) to `/usr/local/bin/`.

### Available Commands

| Command | Description |
|---------|-------------|
| `bb test` | Run the full test suite or selective tests (Django, Cypress E2E, Cypress Component, Vitest) |
| `bb clean` | Tear down and rebuild Docker containers |
| `bb shell` | Open a Django shell in the backend container |
| `bb db` | Open a PostgreSQL shell in the database container |
| `bb coverage` | Generate coverage reports for the Django test suite |
| `bb quality` | Run code quality tools (flake8, black, isort) |
| `bb migrate` | Run Django migrations |
| `bb makemigrations` | Create new Django migrations |
| `bb manage` | Execute any Django management command |
| `bb app` | Create a new Django app |
| `bb dumpdata` | Export database data to YAML |
| `bb loaddata` | Import database data from YAML |

### Usage Examples

```bash
# Run all tests
bb test

# Run only Django tests
bb test -b

# Run only client tests (Cypress + Vitest)
bb test -c

# Run Django tests with options
bb test -b --keepdb --parallel

# Open Cypress test runner
bb test --open

# Get help for any command
bb test --help

# Execute Django management commands
bb manage createsuperuser
bb manage collectstatic

# Create a new Django app
bb app myapp

# Run migrations
bb migrate

# Rollback to a specific migration
bb migrate --rollback myapp 0005_migration_name
```

### Modular Architecture

The `bb` tool uses a modular plugin-based architecture located in `bb.d/`:

```
bb.d/
├── core.sh              # Core framework (command dispatch)
├── lib/                 # Shared utilities
│   ├── colors.sh        # Color definitions
│   ├── docker.sh        # Docker helpers (exec_backend, exec_db)
│   └── formatters.sh    # Output formatters
└── commands/            # Individual command modules
    ├── test.sh
    ├── clean.sh
    ├── shell.sh
    └── ...
```

### Adding New Commands

To add a new command:

1. Create a new file in `bb.d/commands/` (e.g., `mycommand.sh`)
2. Implement two required functions:
   ```bash
   command_mycommand_help() {
       echo "Usage: bb mycommand [options]"
       echo "Description: What your command does"
   }

   command_mycommand_run() {
       # Your command implementation
       exec_backend python manage.py mycommand "$@"
   }
   ```
3. Reinstall: `./dev_setup.sh`
4. The command is now available as `bb mycommand`

All commands have access to shared utilities like `exec_backend()`, `exec_db()`, and color variables (`$GREEN`, `$RED`, etc.).

For more details, see `bb.d/README.md`.

## Process to Sync Changes from the Original Template

1. **Make sure you're in your new project directory**:
   Navigate to the directory of your new project that was created based on the template.

2. **Fetch the latest changes from the original template repository (upstream)**:
   Your new project should already have the original template repo set as an upstream remote (from the script we ran earlier). To fetch the changes from the original template repo, use the following command:
   ```bash
   git fetch upstream
   ```

3. **Review changes (optional)**:
   If you want to see what changes have been made in the original repository, you can check the difference (diff) between your `main` branch and the `upstream/main` branch:
   ```bash
   git diff main..upstream/main
   ```

4. **Merge the changes from the upstream repository**:
   Now, you can merge the changes from the original template repository into your new project’s `main` branch:
   ```bash
   git merge upstream/main
   ```
   If there are no conflicts, this will successfully merge the changes from the original template into your new project.

5. **Resolve conflicts (if any)**:
   If there are any conflicts between your changes and the changes in the original template, Git will flag those as conflicts, and you'll need to manually resolve them.

   After resolving the conflicts, mark the conflicts as resolved:
   ```bash
   git add <resolved-file>
   ```

   Then, commit the resolved changes:
   ```bash
   git commit
   ```

6. **Push the changes to your repository**:
   After merging the changes from the upstream repository, push the merged changes to your new repository (on GitHub):
   ```bash
   git push origin main
   ```

### Summary of Commands:
```bash
# Fetch changes from the upstream (original template repo)
git fetch upstream

# Optionally, check the differences between your branch and upstream/main
git diff main..upstream/main

# Merge changes from upstream/main into your current branch
git merge upstream/main

# Resolve any conflicts if they arise and commit them

# Push the merged changes to your remote repository
git push origin main
```

### Explanation:
- **`git fetch upstream`**: This command fetches the latest changes from the upstream repository (the original template) without modifying your working directory.
- **`git merge upstream/main`**: This command merges the changes from `upstream/main` into your current branch (e.g., `main`).
- **Push the changes**: After resolving conflicts and merging, push the changes to your GitHub repository to keep it up-to-date with the latest updates from the original template.

## Git Branch Strategy
See the [Git Branch Documentation](dev_docs/git-branch-documentation.md].

## Environment Variables

### Backend

DEBUG
SECRET_KEY
DJANGO_ALLOWED_HOSTS
SQL_ENGINE
SQL_DATABASE
SQL_USER
SQL_PASSWORD
SQL_HOST
SQL_PORT
DATABASE

### DB

POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_DB

### Frontend

CHOKIDAR_USEPOLLING
REACT_APP_API_BASE_URL
REACT_APP_NAME
REACT_APP_URL
