# Multi-stage Dockerfile for Next.js application

# ================================
# Stage 1: Dependencies
# ================================
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files for caching
COPY app/package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production

# ================================
# Stage 2: Builder
# ================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install all dependencies (including devDependencies)
COPY app/package*.json ./
RUN npm ci

# Copy source code
COPY app/ .

# Build the Next.js application
RUN npm run build

# ================================
# Stage 3: Runner
# ================================
FROM node:20-alpine AS runner
WORKDIR /app

# Set to production environment
ENV NODE_ENV production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from previous stages
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Switch to non-root user
USER nextjs

# Expose the application port
EXPOSE 3000

# Health check: check if Next.js server is responding
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the Next.js application
CMD ["npm", "start"]