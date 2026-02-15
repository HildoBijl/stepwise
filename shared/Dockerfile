FROM node:16.13.0-alpine AS shared-build
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/*/package.json ./packages/
RUN echo "Package jsons copied"
COPY . .
RUN echo "Installing shared packages"
RUN sh -c 'for p in packages/*; do \
    if [ -f "$p/package.json" ]; then \
      echo "Installing for $p"; \
      (cd "$p" && npm ci --quiet); \
      echo "Building $p"; \
      (cd "$p" && npm run build); \
    fi; \
  done'
RUN echo "Shared packages installed"
RUN npm ci --quiet
RUN echo "Shared all set up"