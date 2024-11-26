#!/bin/bash

green_echo() {
    printf "\e[32m$1\e[0m\n"
}
red_echo() {
    printf "\e[31m$1\e[0m\n"
}

install_homebrew_dependencies() {
    green_echo "Installing system dependencies with Homebrew..."
    # Update Homebrew and install dependencies
    if brew list jpeg &>/dev/null && brew list zlib &>/dev/null && brew list freetype &>/dev/null; then
        green_echo "All required Homebrew dependencies are already installed."
    else
        brew update
        brew install jpeg zlib freetype lcms2 webp tiff libimagequant postgresql
    fi
}

install_pip() {
    if ! command -v pip &>/dev/null; then
        green_echo "Installing pip globally..."
        curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
        python3 get-pip.py
        rm get-pip.py
        python3 -m pip install --upgrade pip
    else
        green_echo "pip is already installed globally."
    fi
}

# Install npm globally if not present
install_npm() {
    if ! command -v npm &>/dev/null; then
        green_echo "Installing npm globally with Homebrew..."
        brew install npm
    else
        green_echo "npm is already installed."
    fi
}

# Create and activate virtual environment
create_virtualenv() {
    if [ ! -d "bb-dev" ]; then
        green_echo "Creating virtual environment 'bb-dev'..."
        python3 -m venv bb-dev
    else
        green_echo "Virtual environment 'bb-dev' already exists."
    fi

    green_echo "Activating virtual environment..."
    source bb-dev/bin/activate

    green_echo "Upgrading pip, setuptools, and wheel in the virtual environment..."
    pip install --upgrade pip setuptools wheel
}

# Install Python dependencies from requirements.txt
install_python_dependencies() {
    green_echo "Installing Python dependencies..."
    if source bb-dev/bin/activate; then
        pip install -r backend/requirements.txt
    else
        red_echo "Failed to activate the virtual environment. Exiting."
        exit 1
    fi
}

# Install Node.js dependencies for the frontend
install_node_dependencies() {
    if [ -d "client" ]; then
        green_echo "Installing Node.js dependencies..."
        npm install --prefix client
    else
        red_echo "Client directory not found. Skipping Node.js dependencies."
    fi
}

# Install and set up pre-commit hooks
setup_precommit() {
    green_echo "Installing pre-commit hooks..."
    if ! command -v pre-commit &>/dev/null; then
        pip install pre-commit
    fi
    pre-commit install
}

# Create .env.secrets file if it doesn't exist
create_env_secrets() {
    if [ ! -f "backend/.env.secrets" ]; then
        green_echo "Creating backend/.env.secrets file..."
        cat <<EOL > backend/.env.secrets
POSTMARK_API_SERVICE_KEY=0
DEFAULT_FROM_EMAIL=system@wilkinsonventures.io
OWNER_EMAIL=joe@wilkinsonventures.io
STRIPE_SECRET_KEY=0
EOL
        green_echo "backend/.env.secrets created."
    else
        green_echo "backend/.env.secrets already exists."
    fi
}

# Install bb.sh helper tool
install_dev_helper() {
    if [ -w /usr/local/bin ]; then
        green_echo "Installing dev helper tool..."
        chmod +x bb.sh
        cp bb.sh /usr/local/bin/bb
    else
        red_echo "Permission denied to copy to /usr/local/bin!"
        read -p "Do you want to use sudo to install the dev helper tool? (y/n): " sudo_response
        if [ "$sudo_response" = "y" ]; then
            sudo chmod +x bb.sh
            sudo cp bb.sh /usr/local/bin/bb
        else
            red_echo "Dev helper tool not installed due to lack of permissions."
        fi
    fi
}

# Main Script
green_echo "Starting Dev Setup..."

read -p "Do you want to install the dev environment? (y/n): " response

if [ "$response" = "y" ]; then
    install_homebrew_dependencies
    install_pip
    install_npm
    create_virtualenv
    install_python_dependencies
    install_node_dependencies
    setup_precommit
    create_env_secrets
    install_dev_helper
    green_echo "Dev setup complete! Activate the virtual environment with 'source bb-dev/bin/activate'."
elif [ "$response" = "n" ]; then
    install_dev_helper
    green_echo "Skipping installs."
else
    red_echo "Invalid response. Please enter 'y' or 'n.'"
    exit 1
fi

green_echo "Complete! Run 'bb --help' for available commands."
exit 0
