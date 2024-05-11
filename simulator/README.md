# Simulator

To demonstrate behavior of OBU and RSU without actual sensor, this program will simulate them with forked processes.

## Structure

This program has two directories, `server` and `web`, when program start server, build with nodejs, it will fork child process following the number of config in `server/repository/[obu|rsu].js`. You can change id (must be matched with MongoDB), aliasname and port to expose as you desired.

for `server/static/*.js`, it has the variable of **array of object** for control the position of routing.

## Setup Guide (First time only)

### Prerequisite

setup `OBU` and `RSU` before

### Step

1. Change directory to `server`
2. `npm install`
3. Repeatly, with `web` directory
4. Change config in `static/*.js`

## Start

1. Change directory to `server`
2. run command

```
npm run start:dev
```
