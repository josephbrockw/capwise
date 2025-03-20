#!/bin/bash

# Check if the new repo name argument is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <new-repo-name>"
  exit 1
fi

# Get the new repository name from the argument
NEW_REPO_NAME="$1"
NEW_REPO="git@github.com:josephbrockw/$NEW_REPO_NAME.git"

# Check if the new repo exists on GitHub
echo "Checking if the repository '$NEW_REPO_NAME' exists..."

# Use GitHub API to check if the repository exists
REPO_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" "https://api.github.com/repos/josephbrockw/$NEW_REPO_NAME")

if [ "$REPO_EXISTS" -eq 200 ]; then
  echo "Error: The repository '$NEW_REPO_NAME' already exists on GitHub. Please choose a different name."
  exit 1
fi

# Original repository URL
ORIGINAL_REPO="git@github.com:josephbrockw/basebuild.git"

# Create a new directory for the new project (outside the basebuild directory)
echo "Creating directory for the new project: $NEW_REPO_NAME"
mkdir "../$NEW_REPO_NAME"
cd "../$NEW_REPO_NAME" || exit

# Clone the original repository into the new directory
echo "Cloning the original repository into $NEW_REPO_NAME..."
git clone "$ORIGINAL_REPO" .

# Change the remote to the new repository
echo "Setting the new repository ($NEW_REPO) as the origin..."
git remote set-url origin "$NEW_REPO"

# Push the content to the new repository
echo "Pushing the project to the new repository..."
git push -u origin main

# Add the original repository as an upstream remote to allow pulling updates
echo "Adding the original repository as upstream..."
git remote add upstream "$ORIGINAL_REPO"

# Fetch the latest updates from the upstream repo
echo "Fetching updates from the original repository..."
git fetch upstream

# Optionally, merge changes from upstream into the current branch
git merge upstream/main

echo -e "\nSetup complete! Here are your follow-up instructions:\n"
echo "1. Go to GitHub and create a new repository with the name: $NEW_REPO_NAME."
echo "   - Ensure that the repository is empty (don't initialize with a README or any files)."
echo "   - After creating it, copy the repository URL provided by GitHub."
echo ""
echo "2. Run the following command to push your local changes to the new repository:"
echo "   git push -u origin main"
echo ""
echo "3. After pushing, you will be able to continue working on your new project and keep it in sync with the original repository."
echo ""
echo "That's it! Your new project is ready, and you can start developing."
