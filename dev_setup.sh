#!/bin/bash

green_echo() {
    printf "\e[32m$1\e[0m\n"
}
red_echo() {
    printf "\e[31m$1\e[0m\n"
}

green_echo "Dev Setup"
read -p "Do you want to install the dev environment? (y/n): " response

if [ "$response" = "y" ]; then
    green_echo "Installing Python dependencies"
    pip install -r ./backend/requirements.txt
    green_echo "  - Activating virtual environment"
    source backend/env/bin/activate
    green_echo "  - Installing Node dependencies"
    npm install ./client
elif [ "$response" = "n" ]; then
    green_echo "Skipping installs."
else
    red_echo "Invalid response. Please enter 'y' or 'n.'"
    exit 1
fi

green_echo "Installing dev helper tool"
chmod +x bb.sh
cp bb.sh /usr/local/bin/bb
pre-commit install
green_echo "Complete! Run 'bb --help' for available commands."
exit 0
