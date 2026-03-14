FROM node:20-alpine AS base
WORKDIR /app

# Copy workspace manifests
COPY package.json ./
COPY packages/shared-types/package.json  ./packages/shared-types/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY services/feed-collector/package.json ./services/feed-collector/

RUN npm install --workspaces --ignore-scripts

# Build shared packages
COPY packages/ ./packages/
RUN npm run build --workspace=packages/shared-types
RUN npm run build --workspace=packages/shared-config

# Build the service
COPY services/feed-collector/ ./services/feed-collector/
RUN npm run build --workspace=services/feed-collector

# ─── Runtime image ───
FROM node:20-alpine AS runtime
WORKDIR /app

COPY --from=base /app/node_modules          ./node_modules
COPY --from=base /app/packages              ./packages
COPY --from=base /app/services/feed-collector/dist    ./services/feed-collector/dist
COPY --from=base /app/services/feed-collector/package.json ./services/feed-collector/

ENV NODE_ENV=production

CMD ["node", "services/feed-collector/dist/index.js"]
