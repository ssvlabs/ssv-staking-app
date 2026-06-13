FROM node:24-alpine@sha256:fb71d01345f11b708a3553c66e7c74074f2d506400ea81973343d915cb64eef0 AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
RUN npm install -g pnpm@10.20.0
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:24-alpine@sha256:fb71d01345f11b708a3553c66e7c74074f2d506400ea81973343d915cb64eef0 AS builder
WORKDIR /app
RUN npm install -g pnpm@10.20.0

ARG MODE=stage
ENV MODE=${MODE}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

COPY .env.${MODE} .env.production

RUN pnpm run build

FROM nginx:alpine@sha256:8b1e78743a03dbb2c95171cc58639fef29abc8816598e27fb910ed2e621e589a AS runner

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
