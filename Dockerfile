FROM node:24-alpine@sha256:8a32c8cf649a49915a66e81e7a609223c708d0adabf288ee3f4077d765542f85 AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
RUN npm install -g pnpm@10.20.0
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:24-alpine@sha256:8a32c8cf649a49915a66e81e7a609223c708d0adabf288ee3f4077d765542f85 AS builder
WORKDIR /app
RUN npm install -g pnpm@10.20.0

ARG MODE=stage
ENV MODE=${MODE}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

COPY .env.${MODE} .env.production

RUN pnpm run build

FROM nginx:alpine@sha256:785835ea65db4bba6f021acc0f3be91b0fef76a53fe41f8588c6698d2aed0606 AS runner

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
