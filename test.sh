#!/bin/bash

docker run --rm \
	-v $(pwd)/frontend:/app \
	-w /app \
	-e CI=true \
	node:12.16.3-alpine npm test
