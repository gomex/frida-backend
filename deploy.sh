#!/bin/bash

PATH=$PATH:/usr/local/node/node-default/bin
GIT_COMMIT_SHA=$1

pushd /home/frida/components/frida-backend
  echo "deploying $GIT_COMMIT_SHA"
  pm2 stop frida-backend
  git fetch
  git checkout $GIT_COMMIT_SHA
  npm install
  pm2 start pm2-config.json
popd
