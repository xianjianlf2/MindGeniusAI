# 构建上下文必须是仓库根目录：
#   docker build -f apps/web/Dockerfile .
FROM node:22-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm@11

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/web/package.json apps/web/

RUN pnpm install --frozen-lockfile --filter @mindgenius/web...

COPY packages/shared packages/shared
COPY apps/web apps/web

RUN pnpm --filter @mindgenius/web build

FROM nginx:alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
