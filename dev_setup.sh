#!/bin/bash

green_echo() {
    printf "\e[32m$1\e[0m\n"
}
red_echo() {
    printf "\e[31m$1\e[0m\n"
}

install_pip() {
  green_echo "Installing pip..."
  curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
  python3 get-pip.py
  rm get-pip.py
  python3 -m pip install --upgrade pip
}

install_npm() {
    green_echo "Installing npm..."
    brew install npm
}

install_pre_commit() {
    green_echo "Installing pre-commit..."
    pip install pre-commit
}

create_env_secrets() {
    green_echo "Creating backend/.env.secrets file..."
    cat <<EOL > backend/.env.secrets
POSTMARK_API_SERVICE_KEY=0
DEFAULT_FROM_EMAIL=system@wilkinsonventures.io
OWNER_EMAIL=joe@wilkinsonventures.io
STRIPE_SECRET_KEY=0
EOL
    green_echo "backend/.env.secrets created."
}

green_echo "Dev Setup"
read -p "Do you want to install the dev environment? (y/n): " response

if [ "$response" = "y" ]; then
    green_echo "Checking for required dependencies..."

    # Check and install pip
    if ! command -v pip &> /dev/null; then
        red_echo "pip not found!"
        read -p "Do you want to install pip? (y/n): " install_pip_response
        if [ "$install_pip_response" = "y" ]; then
            install_pip
        else
            red_echo "pip is required. Exiting."
            exit 1
        fi
    else
        green_echo "pip is already installed."
    fi

    # Check for virtual environment
    if [ ! -f "./bb-dev/bin/activate" ]; then
        red_echo "Virtual environment not found!"
        read -p "Do you want to create a virtual environment? (y/n): " create_env_response
        if [ "$create_env_response" = "y" ]; then
            green_echo "Creating virtual environment..."
            python3 -m venv ./bb-dev
        else
            red_echo "Virtual environment is required. Exiting."
            exit 1
        fi
    else
        green_echo "Virtual environment found."
    fi

    # Activate the virtual environment
    green_echo "Activating virtual environment..."
    source bb-dev/bin/activate

    # Install Python dependencies
    green_echo "Installing Python dependencies..."
    pip install -r ./backend/requirements.txt

    # Check and install npm
    if ! command -v npm &> /dev/null; then
        red_echo "npm not found!"
        read -p "Do you want to install npm? (y/n): " install_npm_response
        if [ "$install_npm_response" = "y" ]; then
            install_npm
        else
            red_echo "npm is required. Exiting."
            exit 1
        fi
    else
        green_echo "npm is already installed."
    fi

    # Install Node dependencies
    green_echo "Installing Node dependencies..."
    npm install ./client

    # Check and install pre-commit
    if ! command -v pre-commit &> /dev/null; then
        red_echo "pre-commit not found!"
        read -p "Do you want to install pre-commit? (y/n): " install_pre_commit_response
        if [ "$install_pre_commit_response" = "y" ]; then
            install_pre_commit
        else
            red_echo "pre-commit is required. Exiting."
            exit 1
        fi
    else
        green_echo "pre-commit is already installed."
    fi

    green_echo "Installing pre-commit hooks..."
    pre-commit install

    # Check and create .env.secrets file if not present
    if [ ! -f "backend/.env.secrets" ]; then
        red_echo "backend/.env.secrets not found!"
        read -p "Do you want to create a default .env.secrets file? (y/n): " create_env_secrets_response
        if [ "$create_env_secrets_response" = "y" ]; then
            create_env_secrets
        else
            red_echo "backend/.env.secrets is required. Exiting."
            exit 1
        fi
    else
        green_echo "backend/.env.secrets already exists."
    fi

elif [ "$response" = "n" ]; then
    green_echo "Skipping installs."
else
    red_echo "Invalid response. Please enter 'y' or 'n.'"
    exit 1
fi

# Check for permissions and copy bb.sh
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

green_echo "Complete! Run 'bb --help' for available commands."
exit 0
