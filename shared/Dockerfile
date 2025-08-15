FROM node:16.13.0-alpine AS test
WORKDIR /app
COPY shared/package.json shared/package-lock.json ./
RUN npm ci
COPY shared .
CMD ["npm", "test"]
