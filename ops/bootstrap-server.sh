#!/bin/bash

set -e
error_message() {
	echo -e '\n\033[41m     ERROR     \033[0m'
	echo 'See the output above for error messages.'
	echo 'Fix the errors and run the script again on a fresh machine.'
	exit 1
}
trap 'error_message' ERR

#
#	Update operating system
#
dnf update -y

#
# Install `docker` and `docker-compose`
#
dnf config-manager --add-repo=https://download.docker.com/linux/centos/docker-ce.repo
dnf install -y docker-ce --nobest
systemctl enable docker
systemctl start docker

curl -L https://github.com/docker/compose/releases/download/1.25.5/docker-compose-`uname -s`-`uname -m` -o /usr/bin/docker-compose
chmod +x /usr/bin/docker-compose

#
# Install `git` and initialise repo
#
dnf install -y git
git clone https://github.com/HildoBijl/stepwise.git /app
chmod 0700 /app
cp /app/ops/app.service /etc/systemd/system/
systemctl enable app

#
#	Enable remote commands
#
echo -e '\nPATH=$PATH:/app/ops/bin' >> ~/.bashrc
exec bash
