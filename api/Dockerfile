FROM node:12.16.3-alpine
COPY --from=shared_build /app /shared
WORKDIR /app
COPY . .
RUN npm ci --quiet
USER node
CMD ["npm", "start"]
