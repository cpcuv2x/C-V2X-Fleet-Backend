#!/bin/sh
DATA_VOLUME=~/Desktop/mongodb-data
INITIAL_SCRIPT_PATH=./mongo-init.js

ROOT_PWD=$1

MONGO_ROOT_USERNAME="Exat"
MONGO_ROOT_PASSWORD="Mongo_Exat2024"
MONGO_DB_NAME="EXAT2024"

## echo ${ROOT_PWD} | sudo -S mkdir -p ${DATA_VOLUME}

# echo ${ROOT_PWD} | sudo -S docker run -p 27017:27017 --name mongodb -d -e MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USERNAME} -e MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD} -e MONGO_INITDB_DATABASE=${MONGO_DB_NAME} -v ${DATA_VOLUME}:/data/db -v ${INITIAL_SCRIPT_PATH}:/docker-entrypoint-initdb.d/init.js mongo
echo ${ROOT_PWD} | sudo -S docker run -p 27017:27017 --name mongodb -d -e MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USERNAME} -e MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD} -e MONGO_INITDB_DATABASE=${MONGO_DB_NAME} -v ${DATA_VOLUME}:/data/db mongo

# mongosh --authenticationDatabase admin --host localhost -u mongoadmin -p mongopasswd app_db_name

