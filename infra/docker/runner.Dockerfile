FROM mcr.microsoft.com/playwright:v1.44.1-jammy AS builder
WORKDIR /app
COPY package.json tsconfig.json ./
COPY apps/runner/package.json ./apps/runner/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/test-compiler/package.json ./packages/test-compiler/
RUN npm install --workspaces
COPY packages/shared-types ./packages/shared-types
COPY packages/test-compiler ./packages/test-compiler
COPY apps/runner ./apps/runner
RUN npm run build -w packages/shared-types
RUN npm run build -w packages/test-compiler
RUN npm run build -w apps/runner

FROM mcr.microsoft.com/playwright:v1.44.1-jammy
WORKDIR /app
COPY --from=builder /app/apps/runner/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3002
CMD ["node", "dist/server.js"]
