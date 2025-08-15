# Stage 1: Build shared code
FROM node:16.13.0-alpine AS shared-build
WORKDIR /app
COPY shared/package.json shared/package-lock.json ./
RUN npm ci --quiet
COPY shared .

# Stage 2: Build frontend
FROM node:16.13.0-alpine AS frontend-build
WORKDIR /app

# Declare ARGs for build-time config
ARG REACT_APP_API_ADDRESS
ARG REACT_APP_API_WEBSOCKET_ENDPOINT
ARG REACT_APP_GOOGLE_CLIENT_ID
ARG REACT_APP_GOOGLE_REDIRECT_ADDRESS

# Install dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --quiet
COPY frontend .
COPY --from=shared-build /app /shared

# Build with environment variables
ENV REACT_APP_API_ADDRESS=$REACT_APP_API_ADDRESS
ENV REACT_APP_API_WEBSOCKET_ENDPOINT=$REACT_APP_API_WEBSOCKET_ENDPOINT
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID
ENV REACT_APP_GOOGLE_REDIRECT_ADDRESS=$REACT_APP_GOOGLE_REDIRECT_ADDRESS

# Build React app
RUN npm run build

# Stage 3: Create test image
FROM node:16.13.0-alpine AS test
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --quiet
COPY frontend .
COPY --from=shared-build /app /shared
CMD ["npm", "test"]
