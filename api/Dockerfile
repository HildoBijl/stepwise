FROM node:24-alpine AS workspace-build
WORKDIR /app

COPY package.json package-lock.json ./
COPY . .
RUN npm ci --quiet --no-audit --no-fund
RUN npm run build:packages

FROM workspace-build AS api-build
WORKDIR /app/api
USER node
CMD ["npm", "start"]
