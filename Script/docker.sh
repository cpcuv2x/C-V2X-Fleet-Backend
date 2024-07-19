#!/bin/bash
SUDOPASS=$1
# Setting up Docker's apt repository

# Add Docker's official GPG key:
echo ${SUDOPASS} | sudo -S apt-get update
echo ${SUDOPASS} | sudo -S apt-get install ca-certificates curl
echo ${SUDOPASS} | sudo -S install -m 0755 -d /etc/apt/keyrings
echo ${SUDOPASS} | sudo -S curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo ${SUDOPASS} | sudo -S chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update

# Install Docker
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin