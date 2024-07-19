#!/bin/bash
SUDOPASS=$1

# List of packages to install before building Janus
packagelist=(
    git
	wget
	nano
	cmake
	automake
	build-essential
	openssl 
	libssl-dev
)

echo ${SUDOPASS} | sudo -S apt-get -y update
echo ${SUDOPASS} | sudo -S apt-get -y upgrade

echo ${SUDOPASS} | sudo -S apt-get install -y ${packagelist[@]}
