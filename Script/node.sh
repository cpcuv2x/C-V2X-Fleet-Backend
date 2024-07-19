#!/bin/sh

SUDOPASS=$1

# Install nodejs 20.x LTS
# https://github.com/nodesource/distributions

# Download the Node.js setup script
curl -fsSL https://deb.nodesource.com/setup_20.x -o nodesource_setup.sh

# Run the Node.js setup script with sudo
echo ${SUDOPASS} | sudo -S -E bash nodesource_setup.sh

# Install Node.js
echo ${SUDOPASS} | sudo -S apt-get install -y nodejs