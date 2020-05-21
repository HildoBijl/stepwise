#!/bin/bash

docker build \
	--no-cache \
	--build-arg REACT_APP_API_ADDRESS='http://api.step-wise.com' \
	--tag=frontend_build \
	../frontend

docker-compose -p app build \
	--no-cache
