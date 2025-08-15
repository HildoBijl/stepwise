# Stage 1: Build shared code
FROM node:16.13.0-alpine AS shared-build
WORKDIR /app
COPY shared/package.json shared/package-lock.json ./
RUN npm ci --quiet
COPY shared .

# Stage 2: Build API
FROM node:16.13.0-alpine
WORKDIR /app
COPY api/package.json api/package-lock.json ./
RUN npm ci --quiet
COPY api .
COPY --from=shared-build /app /shared
USER node
CMD ["npm", "start"]
