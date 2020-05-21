#!/bin/bash

docker build \
	--no-cache \
	--tag=frontend_build \
	../frontend

docker-compose -p app build \
	--no-cache
