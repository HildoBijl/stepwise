# Stage 1: Build shared code
FROM node:16.13.0-alpine AS shared-build
WORKDIR /app
COPY shared/package.json shared/package-lock.json ./
RUN npm ci --quiet
COPY shared .

# Stage 2: Build frontend
FROM node:16.13.0-alpine AS frontend-build
WORKDIR /app

# Declare build args
ARG REACT_APP_API_ADDRESS
ARG REACT_APP_API_WEBSOCKET_ENDPOINT
ARG REACT_APP_GOOGLE_CLIENT_ID
ARG REACT_APP_GOOGLE_REDIRECT_ADDRESS

# Set environment variables for CRA
ENV REACT_APP_API_ADDRESS=$REACT_APP_API_ADDRESS
ENV REACT_APP_API_WEBSOCKET_ENDPOINT=$REACT_APP_API_WEBSOCKET_ENDPOINT
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID
ENV REACT_APP_GOOGLE_REDIRECT_ADDRESS=$REACT_APP_GOOGLE_REDIRECT_ADDRESS

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --quiet
COPY frontend .
COPY --from=shared-build /app /shared
RUN npm run build

# Stage 3: Final Nginx image
FROM nginx:1.18.0-alpine
COPY ops/gateway/nginx.conf /etc/nginx/nginx.conf
COPY --from=frontend-build /app/build /www
