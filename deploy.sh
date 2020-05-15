#!/bin/bash

git push -u production master
ssh step-wise.com << EOF
cd /app
git pull
./build.sh
systemctl restart app
EOF
