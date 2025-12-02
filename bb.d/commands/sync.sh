#!/bin/bash

# Help function
command_sync_help() {
    echo "Usage: bb sync [options]"
    echo ""
    echo "Sync changes from the BaseBuild template repository."
    echo ""
    echo "Options:"
    echo "  --dry-run    Show what would be done without making changes"
    echo "  --no-push    Fetch and merge but don't push to origin"
    echo "  -h, --help   Show this help message"
    echo ""
    echo "This command fetches the latest changes from the upstream BaseBuild"
    echo "template and merges them into your current branch."
}

# Run function
command_sync_run() {
    local dry_run=false
    local no_push=false

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                dry_run=true
                shift
                ;;
            --no-push)
                no_push=true
                shift
                ;;
            -h|--help)
                command_sync_help
                return 0
                ;;
            *)
                echo -e "${RED}Error: Unknown option: $1${NC}"
                command_sync_help
                return 1
                ;;
        esac
    done

    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}Error: Not in a git repository${NC}"
        return 1
    fi

    # Check if upstream remote exists
    if ! git remote get-url upstream > /dev/null 2>&1; then
        echo -e "${RED}Error: 'upstream' remote not configured${NC}"
        echo ""
        echo "Add the upstream remote with:"
        echo "  git remote add upstream git@github.com:josephbrockw/basebuild.git"
        return 1
    fi

    echo -e "${BOLD}Syncing from BaseBuild template...${NC}"
    echo ""

    if [ "$dry_run" = true ]; then
        echo -e "${YELLOW}[DRY RUN] Would execute:${NC}"
        echo "  git fetch upstream"
        echo "  git merge upstream/main"
        if [ "$no_push" = false ]; then
            echo "  git push origin main"
        fi
        return 0
    fi

    # Fetch from upstream
    echo -e "${BLUE}→ Fetching from upstream...${NC}"
    if ! git fetch upstream; then
        echo -e "${RED}Error: Failed to fetch from upstream${NC}"
        return 1
    fi

    echo ""
    echo -e "${BLUE}→ Merging upstream/main...${NC}"

    # Check if there are uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        echo -e "${YELLOW}Warning: You have uncommitted changes${NC}"
        read -p "Continue with merge? (y/n): " continue_merge
        if [ "$continue_merge" != "y" ]; then
            echo "Sync cancelled"
            return 1
        fi
    fi

    # Merge upstream/main
    if ! git merge upstream/main; then
        echo ""
        echo -e "${RED}Merge conflicts detected!${NC}"
        echo ""
        echo "Resolve conflicts manually, then:"
        echo "  git add <resolved-files>"
        echo "  git commit"
        if [ "$no_push" = false ]; then
            echo "  git push origin main"
        fi
        return 1
    fi

    echo -e "${GREEN}✓ Merge successful${NC}"

    # Push to origin if not disabled
    if [ "$no_push" = false ]; then
        echo ""
        echo -e "${BLUE}→ Pushing to origin...${NC}"
        if ! git push origin main; then
            echo -e "${RED}Error: Failed to push to origin${NC}"
            echo "You may need to push manually"
            return 1
        fi
        echo -e "${GREEN}✓ Push successful${NC}"
    fi

    echo ""
    echo -e "${GREEN}✓ Sync complete!${NC}"
}
