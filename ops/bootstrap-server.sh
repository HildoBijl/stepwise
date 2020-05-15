#!/bin/bash

##############################################################
### Bootstrap a CentOS 8 Server
### This script is supposed to be run under the `root` user
##############################################################

#
#	Basic setup of operating system
#
dnf update -y

#
# Install `docker` and `docker-compose`
#
dnf config-manager --add-repo=https://download.docker.com/linux/centos/docker-ce.repo
dnf install -y docker-ce --nobest
systemctl start docker
systemctl enable docker

curl -L https://github.com/docker/compose/releases/download/1.25.5/docker-compose-`uname -s`-`uname -m` -o /usr/bin/docker-compose
chmod +x /usr/bin/docker-compose

#
# Install `git` and initialise repo
#
dnf install -y git
git clone https://github.com/HildoBijl/stepwise.git /app
cd /app
./build.sh
cd ops
cp app.service /etc/systemd/system/
systemctl start app
systemctl enable app
