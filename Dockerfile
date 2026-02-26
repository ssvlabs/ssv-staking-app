FROM node:24-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:24-alpine AS builder
WORKDIR /app
RUN corepack enable

# Define build argument with a default value: can be stage or prod
ARG MODE=stage
ENV MODE=${MODE}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Copy the appropriate env file based on MODE
RUN if [ "$MODE" = "mainnet" ]; then \
      cp .env.mainnet .env.production.local; \
    elif [ "$MODE" = "hoodi" ]; then \
      cp .env.hoodi .env.production.local; \
    else \
      cp .env.stage .env.production.local; \
    fi

RUN pnpm run build

FROM node:24-alpine AS runner
WORKDIR /app
RUN corepack enable

# Set MODE env var for runtime
ARG MODE=stage
ENV MODE=${MODE}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
