FROM node:16.13.0-alpine AS shared-build
WORKDIR /app

# 1) copy shared root manifests (for caching)
COPY package.json package-lock.json ./
COPY packages/*/package.json ./packages/
RUN echo "Package jsons copied"

# 2) install root deps (includes typescript in devDependencies)
RUN npm ci --quiet --include=dev

# 3) copy source afterwards
COPY . .

# 4) optionally install per-package deps if you still need them (file: dependencies)
#    but often running root npm ci in step 2 will suffice for dev deps and linking.
RUN echo "Installing shared packages"
RUN sh -c 'for p in packages/*; do \
    if [ -f "$p/package.json" ]; then \
      echo "Installing for $p"; \
      (cd "$p" && npm ci --quiet || true); \
    fi; \
  done'
RUN echo "Shared packages installed"

# 5) now tsc is available; build all packages with project references
RUN npx tsc -b packages/* --verbose
RUN echo "Shared all set up"
