FROM node:24-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:24-alpine AS builder
WORKDIR /app
RUN corepack enable

ARG MODE=stage
ENV MODE=${MODE}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

COPY .env.${MODE} .env.production

RUN pnpm run build

FROM nginx:alpine AS runner

COPY --from=builder /app/build /usr/share/nginx/html

# SPA fallback: serve index.html for all routes
RUN printf 'server {\n\
  listen 3000;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
