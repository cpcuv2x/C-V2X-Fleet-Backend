#!/bin/sh

SUDOPASS=$1
DISTRO=$(lsb_release -c | awk '{print $2}')

echo ${SUDOPASS} | sudo -S mkdir -p /etc/apt/keyrings
curl -fsSL https://packages.openvpn.net/packages-repo.gpg | sudo tee /etc/apt/keyrings/openvpn.asc
echo "deb [signed-by=/etc/apt/keyrings/openvpn.asc] https://packages.openvpn.net/openvpn3/debian $DISTRO main" | sudo tee /etc/apt/sources.list.d/openvpn-packages.list

sudo apt update
sudo apt install -y openvpn3

## openvpn3 config-import --config /file/to/profile.ovpn --name EXAT-CV2X --persistent
## openvpn3 config-acl --show --lock-down true --grant root --config EXAT-CV2X
## sudo systemctl enable --now openvpn3-session@EXAT-CV2X.service
