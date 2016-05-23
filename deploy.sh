#!/bin/bash

PATH=$PATH:/usr/local/node/node-default/bin
GIT_COMMIT_SHA=$1

pushd /home/frida/components/frida-backend
  pm2 stop frida-backend
  git fetch
  git checkout ${GIT_COMMIT_SHA=master}
  npm install
  pm2 start pm2-config.json
popd
