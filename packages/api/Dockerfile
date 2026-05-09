FROM node:20-alpine AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/api packages/api
COPY packages/shared packages/shared
RUN corepack enable && pnpm install --frozen-lockfile
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/packages/api/dist ./dist
COPY --from=builder /app/packages/api/prisma ./prisma
COPY --from=builder /app/packages/api/package.json ./
RUN corepack enable && pnpm install --prod
RUN pnpm db:generate
CMD ["node", "dist/index.js"]
