# MindGenius AI

<p>
  <a href="https://mindgenius.onrender.com"><img src="https://img.shields.io/badge/Live%20Demo-online-brightgreen?style=flat" alt="Live Demo" /></a>
  <a href="https://github.com/xianjianlf2/MindGeniusAI/actions/workflows/ci.yml"><img src="https://github.com/xianjianlf2/MindGeniusAI/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="package.json"><img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen" alt="Node" /></a>
</p>

[English](README.md) · **简体中文**

和 **Hermas** 对话 —— 一个会自主规划、读你的 PDF、并实时画出可编辑思维导图的 AI 智能体，每一步工具调用都看得见。

🔗 **[在线体验 →](https://mindgenius.onrender.com)** · 自带 API Key（只存在你的浏览器里）。_首次打开可能要等约 30 秒唤醒。_

![MindGenius AI —— Hermas 规划后，把可编辑思维导图实时画出来](docs/assets/demo.gif)

## ⚡️ 快速开始

```bash
pnpm install
pnpm setup     # 选供应商、粘贴 Key → 生成 apps/server/.env
pnpm dev       # web 跑在 :5173，api 跑在 :3000
```

向导里没填 Key？跳过即可，之后在应用右上角**「设置」**里填 —— 只存在你的浏览器里。

## ✨ 功能

- 🤖 **真智能体，不是套壳 prompt** —— 多步工具调用循环（Vercel AI SDK v5），自己决定何时检索文档、生成导图、扩展分支，每步以实时工具卡片呈现。
- ✏️ **外科式编辑** —— 一句「把定价分支改名」即按节点 id 精准打补丁，手动改动不被冲掉（不整图重画）。
- 🤝 **双向画布** —— 你手动改节点（改名、增删、拖拽），下次发消息时 Hermas 能看到你*具体动了哪里*，像协作者一样顺势接着做，而不只是看到最新快照。
- 📄 **读你的 PDF** —— 点 📎 附加一篇或多篇 PDF：切块 → 向量化 → 内存检索（约 100 行，不依赖 LangChain）。`rag_query` 一次跨所有附加文档检索。
- ⌨️ **键盘优先画布** —— `Tab` 子节点 · `Enter` 兄弟节点 · `F2` 重命名 · `Del` 删除 · `⌘Z` 撤销 · **拖一个节点到另一个上即改父**。
- ⌘ **命令面板（⌘K）** —— Cursor 式浮层，模糊搜索已保存的导图 + 上传文档；`↵` 打开导图或附加文档。
- 🔁 **导入 / 导出** —— 导入 Markdown / OPML，导出 **PNG · SVG · Markdown · OPML · Mermaid**。
- 🔑 **自带 Key** —— OpenAI / Claude / DeepSeek / Kimi，或任意 OpenAI 兼容端点。Key 从不落到服务端磁盘。
- 🎨 **一块专注的工作台** —— 对话 + 画布 + 文档抽屉；刷新不丢；中英双语；克制暗色、零 UI 框架依赖。

## 🔧 配置

`pnpm setup` 会帮你生成 `apps/server/.env`。想手动配，把 `apps/server/.env.example` 复制成 `apps/server/.env` 再改。

| 供应商 | Embeddings（RAG） |
| --- | --- |
| OpenAI · Claude | ✅ 完整 RAG |
| DeepSeek · Kimi | ⚠️ 无 embeddings，RAG 自动降级；把 `EMBEDDING_API_KEY` 指向任意 OpenAI 兼容端点即可保留 |

## 🚀 Docker

整个应用打包成**一个镜像**（server 同时托管 web 产物 + API）：

```bash
docker run -p 3000:3000 -e OPENAI_API_KEY=sk-... ghcr.io/xianjianlf2/mindgeniusai
# 打开 http://localhost:3000
```

或本地构建：`cp apps/server/.env.example apps/server/.env && docker compose up --build`。

不填 Key 即让每位访客在**「设置」**里自带。

[![Deploy to Spaces](https://huggingface.co/datasets/huggingface/badges/resolve/main/deploy-to-spaces-lg.svg)](https://huggingface.co/new-space?sdk=docker&name=mindgenius) —— 在 Hugging Face Spaces 免费跑（Docker）。保留 `sdk: docker` / `app_port: 3000`；把 `OPENAI_API_KEY` 设为 secret 或留空走访客自带。

> 🛡 托管护栏（保护免费实例）：单文件 ≤ `MAX_UPLOAD_MB`（默认 10MB）、最多索引 `MAX_INDEXED_DOCS` 篇（默认 20）、单篇 ≤ `MAX_CHUNKS_PER_DOC` 块；设 `DISABLE_UPLOAD=true` 可彻底关上传。配合服务端 Key 留空，你的 API 成本为零。

## 🗂 脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm setup` | 首次配置向导 |
| `pnpm dev` | 并行运行 web + server |
| `pnpm build` | 类型检查并构建全部包 |
| `pnpm test` | 运行 vitest workspace |
| `pnpm lint` | eslint |

## 🏗 架构

```
apps/web/      React 18 + Vite + Zustand + AntV X6（自定义设计系统）
apps/server/   Hono + Vercel AI SDK v5（Hermas 智能体、RAG、SSE 流式）
packages/shared/  两端共用的 SSE / 智能体事件协议
```

- **智能体循环** —— `streamText` + `stopWhen: stepCountIs(8)`，四个 zod 强类型工具（`mindmap_generate` / `node_expand` / `rag_query` / `mindmap_edit`）。
- **实时编辑** —— `mindmap_edit` 产出 `add`/`update`/`remove` 指令，按节点 id 应用到树上。
- **双向同步** —— 你的手动改动复用同一套 op 模型，按来源缓冲（并去重）后作为 `recentEdits` 随请求发出，让智能体知道*你*在它上一轮之后改了什么，而非仅当前轮廓。
- **RAG** —— pdf-parse → 重叠切块 → `embedMany` → 余弦检索，进程内完成。
- **多供应商** —— 每个请求从请求头解析；Key 从不存服务端。

完整设计见 [docs/REFACTOR_PLAN.md](docs/REFACTOR_PLAN.md)。

## 使用统计（可选）

无 cookie、仅计数（页面浏览 + `agent_run` 事件），可用 Umami / GoatCounter / Cloudflare。绝不上报对话、PDF 或 Key。见 `apps/web/.env.example`。

## 许可证

[MIT](LICENSE)

## Star 趋势

[![Star History Chart](https://api.star-history.com/svg?repos=xianjianlf2/MindGeniusAI&type=Date)](https://star-history.com/#xianjianlf2/MindGeniusAI&Date)
</content>
