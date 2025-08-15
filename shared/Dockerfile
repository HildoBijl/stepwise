FROM node:16.13.0-alpine AS shared-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --quiet
COPY . .
