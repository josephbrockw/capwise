# Git Branch Management Guidelines
## For SaaS Development Team

## Table of Contents
1. [Branch Strategy Overview](#branch-strategy-overview)
2. [Branch Naming Conventions](#branch-naming-conventions)
3. [Developer Workflow](#developer-workflow)
4. [Code Review Process](#code-review-process)
5. [Deployment Process](#deployment-process)
6. [Hotfix Procedure](#hotfix-procedure)
7. [Branch Cleanup](#branch-cleanup)

## Branch Strategy Overview

Our SaaS product uses a modified GitFlow branching strategy with the following primary branches:

- **`main`**: Contains production-ready code that is always deployable
- **`develop`**: Integration branch for completed features before release
- **`release/*`**: Preparation branches for upcoming releases
- **`feature/*`**: Development of new features
- **`bugfix/*`**: Bug fixes that are not urgent
- **`hotfix/*`**: Urgent fixes for production issues

## Branch Naming Conventions

All branches should follow these naming patterns:

- **Feature branches**: `feature/ABC-123-short-description`
- **Bug fix branches**: `bugfix/ABC-123-short-description`
- **Hotfix branches**: `hotfix/ABC-123-short-description`
- **Release branches**: `release/v1.2.3`

Where:
- `ABC-123` is the ticket/issue ID from our project management system
- `short-description` is a brief, hyphenated description of the change
- `v1.2.3` follows semantic versioning (MAJOR.MINOR.PATCH)

## Developer Workflow

### Starting New Work

1. **Update your local repository**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Create a new feature branch**
   ```bash
   git checkout -b feature/ABC-123-feature-description develop
   ```

3. **Push the branch to remote** (to establish tracking)
   ```bash
   git push -u origin feature/ABC-123-feature-description
   ```

### During Development

4. **Commit changes regularly** with meaningful commit messages
   ```bash
   git commit -m "ABC-123: Implement user authentication flow"
   ```

5. **Push changes to remote**
   ```bash
   git push
   ```

6. **Keep your branch updated** with the latest from develop
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/ABC-123-feature-description
   git merge develop
   ```
   Resolve any conflicts that arise.

### Completing a Feature

7. **Ensure tests pass** and code meets quality standards

8. **Create a pull request (PR)** from your feature branch to `develop`

9. **Address review feedback** until PR is approved

10. **Merge the PR** (preferably using the squash-and-merge option)

11. **Delete the feature branch** after it's merged

## Code Review Process

1. **PR Requirements**:
   - PR title includes ticket ID and brief description
   - PR description explains the changes and testing performed
   - All automated tests pass
   - Code meets our coding standards

2. **Reviewers should check**:
   - Code correctness and quality
   - Test coverage
   - Documentation updates
   - Performance implications
   - Security considerations

3. **Approval Process**:
   - At least two approvals required for merging
   - All blocking comments must be resolved

## Deployment Process

### Regular Deployment Cycle

1. **Prepare Release**
   ```bash
   git checkout -b release/v1.2.3 develop
   ```

2. **Version Updates** (update version numbers in appropriate files)
   ```bash
   # Update version numbers in package.json, etc.
   git commit -m "Bump version to 1.2.3"
   ```

3. **Final Testing** in staging environment

4. **Finalize Release**
   ```bash
   # Merge to main
   git checkout main
   git merge --no-ff release/v1.2.3 -m "Release v1.2.3"
   git tag -a v1.2.3 -m "Version 1.2.3"
   git push origin main --tags

   # Back-merge to develop
   git checkout develop
   git merge --no-ff release/v1.2.3 -m "Merge release v1.2.3 back to develop"
   git push origin develop

   # Delete release branch
   git branch -d release/v1.2.3
   git push origin --delete release/v1.2.3
   ```

5. **Deploy to Production**
   - CI/CD pipeline automatically deploys tagged commits from `main`
   - Monitor deployment for any issues

### Deployment Environments

1. **Development**: Automatic deployment from `develop` branch
2. **Staging**: Deployment from `release/*` branches for testing
3. **Production**: Deployment from `main` branch after release is finalized

## Hotfix Procedure

For urgent production issues:

1. **Create hotfix branch** from `main`
   ```bash
   git checkout -b hotfix/ABC-123-critical-fix main
   ```

2. **Implement and test** the fix

3. **Create a PR** for the hotfix

4. **After approval, merge to `main`** and tag
   ```bash
   git checkout main
   git merge --no-ff hotfix/ABC-123-critical-fix -m "Hotfix: Critical issue ABC-123"
   git tag -a v1.2.4 -m "Version 1.2.4"
   git push origin main --tags
   ```

5. **Back-merge to `develop`**
   ```bash
   git checkout develop
   git merge --no-ff hotfix/ABC-123-critical-fix -m "Merge hotfix ABC-123 to develop"
   git push origin develop
   ```

6. **Delete the hotfix branch**
   ```bash
   git branch -d hotfix/ABC-123-critical-fix
   git push origin --delete hotfix/ABC-123-critical-fix
   ```

7. **Deploy to Production** via CI/CD pipeline

## Branch Cleanup

1. **Regular cleanup** of merged branches:
   ```bash
   # List merged branches
   git branch --merged

   # Delete local merged branches (except main and develop)
   git branch --merged | grep -v "\*\|main\|develop" | xargs -n 1 git branch -d

   # Delete remote merged branches (with caution)
   git fetch -p
   ```

2. **Stale branch policy**: Branches inactive for more than 30 days should be reviewed and potentially removed.

3. **Automated cleanup**: CI job runs weekly to identify stale branches.

---

## Additional Resources

- [Git documentation](https://git-scm.com/doc)
- [Company internal Git wiki]
- Contact `devops@example.com` for assistance
