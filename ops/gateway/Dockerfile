FROM nginx:1.18.0-alpine AS gateway-build
COPY ops/gateway/nginx.conf /etc/nginx/nginx.conf
COPY --from=frontend-build:latest /app/frontend/build /www
