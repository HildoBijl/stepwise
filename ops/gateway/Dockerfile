FROM node:16.13.0-alpine as frontend-build
FROM nginx:1.18.0-alpine as gateway-build
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=frontend-build /app/build /www
