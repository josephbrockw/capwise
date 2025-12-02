#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Ask about service requirements
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Configure Services for $NEW_REPO_NAME${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. Frontend service
echo -e "${YELLOW}1. Frontend Service${NC}"
echo "   Options: react, django, none"
read -p "   Select [react]: " frontend_choice
frontend_choice=${frontend_choice:-react}
frontend_choice=$(echo "$frontend_choice" | tr '[:upper:]' '[:lower:]')

# Validate frontend choice
while [[ ! "$frontend_choice" =~ ^(react|django|none)$ ]]; do
  echo -e "${YELLOW}   Invalid choice. Please enter: react, django, or none${NC}"
  read -p "   Select [react]: " frontend_choice
  frontend_choice=${frontend_choice:-react}
  frontend_choice=$(echo "$frontend_choice" | tr '[:upper:]' '[:lower:]')
done
echo ""

# 2. Backend service
echo -e "${YELLOW}2. Backend Service${NC}"
echo "   Options: django, none"
read -p "   Select [django]: " backend_choice
backend_choice=${backend_choice:-django}
backend_choice=$(echo "$backend_choice" | tr '[:upper:]' '[:lower:]')

# Validate backend choice
while [[ ! "$backend_choice" =~ ^(django|none)$ ]]; do
  echo -e "${YELLOW}   Invalid choice. Please enter: django or none${NC}"
  read -p "   Select [django]: " backend_choice
  backend_choice=${backend_choice:-django}
  backend_choice=$(echo "$backend_choice" | tr '[:upper:]' '[:lower:]')
done
echo ""

# 2b. Background services (only if Django backend)
if [ "$backend_choice" = "django" ]; then
  echo -e "${YELLOW}2b. Background Services${NC}"
  echo "    Options: django-worker, independent-worker, none"
  read -p "    Select [none]: " worker_choice
  worker_choice=${worker_choice:-none}
  worker_choice=$(echo "$worker_choice" | tr '[:upper:]' '[:lower:]')

  # Validate worker choice
  while [[ ! "$worker_choice" =~ ^(django-worker|independent-worker|none)$ ]]; do
    echo -e "${YELLOW}    Invalid choice. Please enter: django-worker, independent-worker, or none${NC}"
    read -p "    Select [none]: " worker_choice
    worker_choice=${worker_choice:-none}
    worker_choice=$(echo "$worker_choice" | tr '[:upper:]' '[:lower:]')
  done
  echo ""
else
  worker_choice="none"
fi

# 3. Mobile app
echo -e "${YELLOW}3. Mobile App (React Native)${NC}"
read -p "   Include? (y/n) [n]: " mobile_choice
mobile_choice=${mobile_choice:-n}
echo ""

# 4. Documentation
echo -e "${YELLOW}4. Documentation (Docusaurus)${NC}"
read -p "   Include? (y/n) [n]: " docs_choice
docs_choice=${docs_choice:-n}
echo ""

# Convert choices to service flags
use_django=$([ "$backend_choice" = "django" ] && echo "y" || echo "n")
use_react=$([ "$frontend_choice" = "react" ] && echo "y" || echo "n")
use_celery_django=$([ "$worker_choice" = "django-worker" ] && echo "y" || echo "n")
use_celery_worker=$([ "$worker_choice" = "independent-worker" ] && echo "y" || echo "n")
use_workers=$([ "$worker_choice" != "none" ] && echo "y" || echo "n")
use_flower=$([ "$worker_choice" != "none" ] && echo "y" || echo "n")
use_mobile=$mobile_choice
use_docs=$docs_choice

echo -e "${GREEN}✓ Configuration complete${NC}"
echo ""

# Create a new directory for the new project (outside the basebuild directory)
echo "Creating directory for the new project: $NEW_REPO_NAME"
mkdir "../$NEW_REPO_NAME"
cd "../$NEW_REPO_NAME" || exit

# Clone the original repository into the new directory
echo "Cloning the original repository into $NEW_REPO_NAME..."
git clone "$ORIGINAL_REPO" .

# Generate basebuild.toml based on selections
echo "Generating basebuild.toml..."

# Convert y/n to true/false
django_val=$([ "$use_django" = "y" ] && echo "true" || echo "false")
react_val=$([ "$use_react" = "y" ] && echo "true" || echo "false")
celery_django_val=$([ "$use_celery_django" = "y" ] && echo "true" || echo "false")
celery_worker_val=$([ "$use_celery_worker" = "y" ] && echo "true" || echo "false")
broker_val=$([ "$use_workers" = "y" ] && echo "true" || echo "false")
flower_val=$([ "$use_flower" = "y" ] && echo "true" || echo "false")
docs_val=$([ "$use_docs" = "y" ] && echo "true" || echo "false")
mobile_val=$([ "$use_mobile" = "y" ] && echo "true" || echo "false")

cat > basebuild.toml << EOF
# BaseBuild Project Configuration
# Simple service toggles - enable/disable services to spin up with docker-compose

[services]
# Core services
django = $django_val               # Django (and db)
react = $react_val                # React frontend

# Background task services
celery_django = $celery_django_val        # Django-integrated Celery worker
celery_worker = $celery_worker_val        # Independent Python Celery worker
broker = $broker_val               # Redis message broker
flower = $flower_val               # Celery monitoring dashboard

# Optional services
docs = $docs_val                 # Docusaurus documentation
mobile = $mobile_val               # React Native app
EOF

echo -e "${GREEN}✓ Created basebuild.toml${NC}"
echo ""

# Remove unused directories
echo "Cleaning up unused directories..."

# Remove React if not frontend choice
if [ "$frontend_choice" != "react" ] && [ -d "react" ]; then
  echo "  Removing React directory..."
  rm -rf react
fi

# Remove Django if not used as frontend or backend
if [ "$backend_choice" != "django" ] && [ "$frontend_choice" != "django" ] && [ -d "django" ]; then
  echo "  Removing Django directory..."
  rm -rf django
fi

if [ "$use_docs" = "n" ] && [ -d "docs" ]; then
  echo "  Removing docs directory..."
  rm -rf docs
fi

if [ "$use_mobile" = "n" ] && [ -d "app" ]; then
  echo "  Removing app directory..."
  rm -rf app
fi

if [ "$worker_choice" = "none" ] && [ -d "celeryworker" ]; then
  echo "  Removing celeryworker directory..."
  rm -rf celeryworker
fi

echo ""

# Change the remote to the new repository
echo "Setting the new repository ($NEW_REPO) as the origin..."
git remote set-url origin "$NEW_REPO"

# Commit the configuration changes
git add basebuild.toml
# Check if any directories were removed
if [ "$frontend_choice" != "react" ] || [ "$backend_choice" != "django" ] || [ "$use_docs" = "n" ] || [ "$use_mobile" = "n" ] || [ "$worker_choice" = "none" ]; then
  git add -A
  git commit -m "Configure project: frontend=$frontend_choice, backend=$backend_choice, workers=$worker_choice"
fi

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

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Setup Complete! ${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Project:${NC} $NEW_REPO_NAME"
echo -e "${BLUE}Location:${NC} ../$NEW_REPO_NAME"
echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo -e "  ${BLUE}Frontend:${NC} $frontend_choice"
echo -e "  ${BLUE}Backend:${NC} $backend_choice"
[ "$worker_choice" != "none" ] && echo -e "  ${BLUE}Workers:${NC} $worker_choice"
[ "$use_mobile" = "y" ] && echo "  ✓ React Native mobile"
[ "$use_docs" = "y" ] && echo "  ✓ Documentation"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. cd ../$NEW_REPO_NAME"
echo "  2. Run: ./dev_setup.sh"
echo "  3. Run: bb clean (to spin up configured services)"
echo "  4. Run: bb config (to view service configuration)"
echo ""
echo -e "${BLUE}GitHub:${NC}"
echo "  - Create repository: https://github.com/new"
echo "  - Repository name: $NEW_REPO_NAME"
echo "  - Then push: git push -u origin main"
echo ""
echo -e "View basebuild.toml to modify service configuration anytime."
echo ""
