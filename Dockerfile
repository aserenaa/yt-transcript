FROM node:18-slim AS builder

WORKDIR /usr/src/app

# Copy package files first for better layer caching
COPY package.json pnpm-lock.yaml ./

# Enable corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src

# Build the application
RUN pnpm build

FROM node:18-alpine

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /usr/src/app

# Copy built app and package files
COPY --from=builder /usr/src/app/dist ./dist
COPY package.json pnpm-lock.yaml ./

# Enable corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

# Install production dependencies only, skipping prepare script
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# Set proper permissions
RUN chown -R appuser:appgroup /usr/src/app

# Switch to non-root user
USER appuser

EXPOSE 3000

CMD ["node", "dist/main.js"]
