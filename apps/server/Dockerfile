# 构建上下文必须是仓库根目录：
#   docker build -f apps/server/Dockerfile .
FROM node:22-alpine

WORKDIR /app
RUN npm install -g pnpm@11

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/server/package.json apps/server/

RUN pnpm install --frozen-lockfile --filter @mindgenius/server... --prod

COPY packages/shared packages/shared
COPY apps/server apps/server

ENV NODE_ENV=production
EXPOSE 3000
WORKDIR /app/apps/server
CMD ["pnpm", "start"]
