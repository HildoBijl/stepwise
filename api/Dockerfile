FROM shared-build:latest as shared-build
FROM node:16.13.0-alpine as api-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --quiet
COPY . .
COPY --from=shared-build /app /shared
USER node
CMD ["npm", "start"]
