# BaseBuild

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
