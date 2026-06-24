# 单镜像：构建 web 静态产物，由 server 一并托管 —— 一键部署 / 一条命令即用。
#   docker build -t mindgenius .
#   docker run -p 3000:3000 -e OPENAI_API_KEY=sk-... mindgenius
# 然后打开 http://localhost:3000

# ---- 1. 构建 web 静态产物 ----
FROM node:22-alpine AS web-builder
WORKDIR /app
RUN npm install -g pnpm@11

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile --filter @mindgenius/web...

COPY packages/shared packages/shared
COPY apps/web apps/web
RUN pnpm --filter @mindgenius/web build

# ---- 2. server 运行时（一并托管 web） ----
FROM node:22-alpine AS runtime
WORKDIR /app
RUN npm install -g pnpm@11

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/server/package.json apps/server/
RUN pnpm install --frozen-lockfile --filter @mindgenius/server... --prod

COPY packages/shared packages/shared
COPY apps/server apps/server
# 把构建好的 web 放到 server 工作目录下的 public（WEB_DIR 相对启动 cwd 解析）
COPY --from=web-builder /app/apps/web/dist apps/server/public

# 预建可写的 uploads —— HF Spaces 等平台以非 root（UID 1000）运行，否则启动时 mkdir 会 EACCES
RUN mkdir -p apps/server/uploads && chmod -R 777 apps/server/uploads

ENV NODE_ENV=production
ENV WEB_DIR=public
EXPOSE 3000
WORKDIR /app/apps/server
CMD ["pnpm", "start"]
