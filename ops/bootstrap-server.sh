#!/bin/bash

#######################################################################
# This script bootstraps the app environment on a fresh Debian machine.
#######################################################################

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
apt-get update

#
# Install Docker
# 1. Install pre-requisites and configure Docker’s apt repository
# 2. Install Docker engine (which includes docker compose)
#
apt-get update
apt-get install -y \
	ca-certificates \
	curl \
	gnupg \
	lsb-release
mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
docker run --rm hello-world

#
# Install Postgres client (`psql`)
#
apt-get update
apt-get install -y postgresql-client

#
# Install git, and initialise repo
#
apt-get update
apt-get install -y git
git --version
git clone https://github.com/HildoBijl/stepwise.git /app
chmod 0700 /app
cp /app/ops/app.service /etc/systemd/system/
systemctl enable app

#
#	Enable remote commands via SSH
#
echo -e '\nPATH=$PATH:/app/ops/bin' >> ~/.bashrc
exec bash

#
# Setup configuration
#
mkdir /config
chmod 0700 /config
touch /config/api.env
mkdir /config/certificates

#
# Issue intermediate (fake) certificates, so that nginx can start up
#
openssl req -nodes -new -x509 -days 365 \
	-subj '/CN=localhost' \
	-keyout /config/certificates/key.pem \
	-out /config/certificates/cert.pem
curl https://get.acme.sh | sh
mkdir /root/acme
