#!/usr/bin/env bash

cat <<EOF >.env
DATABASE_URL=$DATABASE_URL
HEXO_SOURCE_PATH=$HEXO_SOURCE_PATH
CERT_FILE_PATH=$CERT_FILE_PATH
KEY_FILE_PATH=$KEY_FILE_PATH
EOF
