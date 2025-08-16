FROM nginx:1.18.0-alpine AS gateway-build
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=frontend-build:latest /app/build /www
