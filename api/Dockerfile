FROM node:16.13.0-alpine
COPY --from=shared_build /app /shared
WORKDIR /app
COPY . .
RUN npm ci --quiet
USER node
CMD ["npm", "start"]
