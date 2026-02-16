FROM node:24-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:24-alpine AS runner
WORKDIR /app
RUN corepack enable
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
ENV PORT=3000
CMD ["sh", "-c", "pnpm run build && pnpm run start"]
