FROM node:12.16.3-alpine
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
