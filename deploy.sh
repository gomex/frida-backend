#!/bin/bash

PATH=$PATH:/usr/local/node/node-default/bin

pushd /home/frida/components/frida-backend
  pm2 stop frida-backend
  git pull
  npm install
  pm2 start pm2-config.json
popd
