#!/bin/bash

docker run --rm \
	-v $(pwd)/../frontend:/app \
	-w /app \
	node:12.16.3-alpine npm ci

docker run --rm \
	-v $(pwd)/../frontend:/app \
	-w /app \
	node:12.16.3-alpine npm run build
