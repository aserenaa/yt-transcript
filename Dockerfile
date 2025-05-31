# Dockerfile.prod
FROM node:18-alpine

# 1. Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 2. Copy only manifest + lockfile for caching
COPY package.json pnpm-lock.yaml ./

# 3. Install prod-only deps
RUN pnpm install --frozen-lockfile --prod

# 4. Copy source, build, and run
COPY . .
RUN pnpm build

EXPOSE 3000
CMD ["node", "dist/main.js"]