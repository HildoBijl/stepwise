FROM node:12.16.3-alpine
COPY --from=shared_build /app /shared
WORKDIR /app
COPY . .
ARG REACT_APP_API_ADDRESS
RUN npm ci --quiet
RUN npm run build
