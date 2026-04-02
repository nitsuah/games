# Multi-stage Dockerfile for Next.js application

FROM node:22.21.0-alpine AS deps
WORKDIR /app

# Keep install scripts disabled in container to avoid husky prepare failures.
COPY app/package*.json ./
RUN npm ci --ignore-scripts

FROM node:22.21.0-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY app/ .
RUN npm run build


# --- Shared test base stage ---
FROM node:22.21.0 AS test-base
WORKDIR /app
COPY app/package*.json ./
COPY app/ .
RUN npm ci --ignore-scripts

# --- Lightweight unit test stage (no Playwright) ---
FROM test-base AS test-unit

# --- E2E test stage with Playwright browsers installed ---
FROM test-base AS test-e2e
# Install Playwright browsers for E2E tests
RUN npx playwright install --with-deps

# --- Production runner stage ---
FROM node:22.21.0-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy runtime files
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Prune to production dependencies only, without running install scripts.
RUN npm prune --omit=dev --ignore-scripts

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["npm", "start"]