#!/bin/bash
SUDOPASS=$1

git clone https://github.com/webcamoid/akvcam.git

## build and install
cd akvcam/src
make
echo ${SUDOPASS} | sudo -S make dkms_install

## copy the akvcam.ko to /usr/lib/modules/6.5.0-41-generic/extra
DIR=/usr/lib/modules/6.5.0-41-generic/extra

echo ${SUDOPASS} | sudo -S mkdir -p ${DIR}
echo ${SUDOPASS} | sudo -S cp akvcam.ko ${DIR}/akvcam.ko

## configuration
CONFIG_DIR=/etc/akvcam
echo ${SUDOPASS} | sudo -S mkdir -p ${CONFIG_DIR}
echo ${SUDOPASS} | sudo -S cp config.ini ${CONFIG_DIR}/config.ini
echo ${SUDOPASS} | sudo -S chmod -vf 644 ${CONFIG_DIR}/config.ini
echo ${SUDOPASS} | sudo -S cp default_frame.bmp ${CONFIG_DIR}/default_frame.bmp

## load the module on boot
ONBOOT_FILE=/etc/modules-load.d
echo ${SUDOPASS} | sudo -S cp akvcam.conf ${ONBOOT_FILE}/akvcam.conf