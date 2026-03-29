FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json tsconfig.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/
RUN npm install --workspaces
COPY packages/shared-types ./packages/shared-types
COPY apps/api ./apps/api
RUN npm run build -w packages/shared-types
RUN npm run build -w apps/api

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3001
CMD ["node", "dist/server.js"]
