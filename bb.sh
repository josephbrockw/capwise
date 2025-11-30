#!/bin/bash
# BaseBuild CLI Tool - Main entry point
# This script loads and dispatches to the modular command framework

# Determine the directory where this script and bb.d are located
if [ -L "$0" ]; then
    # Script is a symlink, resolve it
    BB_SCRIPT=$(readlink "$0")
else
    BB_SCRIPT="$0"
fi

BB_DIR="$(cd "$(dirname "$BB_SCRIPT")" && pwd)"
BB_D_DIR="${BB_DIR}/bb.d"

# Verify bb.d directory exists
if [ ! -d "$BB_D_DIR" ]; then
    echo "Error: bb.d directory not found at $BB_D_DIR"
    echo "Please ensure bb.sh and bb.d/ are installed together."
    exit 1
fi

# Load and execute the core framework
source "${BB_D_DIR}/core.sh"
