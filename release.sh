#!/bin/bash

git pull
./build.sh
systemctl restart app
