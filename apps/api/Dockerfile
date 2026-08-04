# syntax=docker/dockerfile:1.7
# Build from repo root:
#   docker build -f apps/api/Dockerfile -t ritmo-api .

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
COPY packages/config/package.json packages/config/
RUN pnpm install --frozen-lockfile --filter @ritmo/api...

FROM base AS builder
COPY --from=deps /app /app
COPY . .
RUN pnpm --filter @ritmo/api exec prisma generate
RUN pnpm --filter @ritmo/api build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S ritmo && adduser -S ritmo -G ritmo
COPY --from=builder --chown=ritmo:ritmo /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder --chown=ritmo:ritmo /app/node_modules ./node_modules
COPY --from=builder --chown=ritmo:ritmo /app/apps/api/package.json ./apps/api/
COPY --from=builder --chown=ritmo:ritmo /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=ritmo:ritmo /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder --chown=ritmo:ritmo /app/packages ./packages
USER ritmo
EXPOSE 3001
WORKDIR /app/apps/api
CMD ["node", "dist/server.js"]
