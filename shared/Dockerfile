FROM node:16.13.0-alpine AS shared-build
WORKDIR /app

# Copy only manifests first so package install layer is cacheable.
COPY package.json package-lock.json ./
COPY packages/*/package.json ./packages/

# Install root dev deps (typescript etc.).
RUN npm ci --quiet --include=dev --no-audit --no-fund

# Copy full source.
COPY . .

# Install per-package deps if package has its own lockfile (tolerant).
RUN for p in packages/*; do \
      [ -f "$p/package.json" ] || continue; \
      (cd "$p" && npm ci --quiet --no-audit --no-fund) || true; \
    done

# Build all TypeScript projects (project references).
RUN npx tsc -b packages/*/tsconfig.json --verbose
