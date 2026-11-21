FROM nginx:1.30.7-alpine AS gateway-build
COPY ops/gateway/nginx.conf /etc/nginx/nginx.conf
COPY --from=frontend-build:latest /app/frontend/dist /www
