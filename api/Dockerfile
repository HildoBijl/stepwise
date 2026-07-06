FROM node:22-alpine AS api-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --quiet
COPY . .
COPY --from=shared-build:latest /app /shared
USER node
CMD ["npm", "start"]
