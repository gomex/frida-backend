#!/bin/bash

PATH=$PATH:/usr/local/node/node-default/bin
pm2 stop frida-backend
git pull
npm install
pm2 start pm2-config.json