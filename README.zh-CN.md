# MindGenius AI

<p>
  <a href="https://mindgenius.onrender.com"><img src="https://img.shields.io/badge/Live%20Demo-online-brightgreen?style=flat" alt="Live Demo" /></a>
  <a href="https://github.com/xianjianlf2/MindGeniusAI/actions/workflows/ci.yml"><img src="https://github.com/xianjianlf2/MindGeniusAI/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="package.json"><img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen" alt="Node" /></a>
  <a href="https://github.com/xianjianlf2/MindGeniusAI/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" /></a>
</p>

[English](README.md) · **简体中文**

和 **Hermas** 对话 —— 一个会自主规划、检索你的文档、并实时为你画出可编辑思维导图的智能体，每一步工具调用都看得见。

> 🔗 **[在线体验 →](https://mindgenius.onrender.com)** —— 自带 OpenAI / Claude / DeepSeek / Kimi 的 API Key，密钥只存在你的浏览器里。_(免费托管 —— 首次打开可能要等约 30 秒唤醒)_

## 演示

![MindGenius AI —— Hermas 规划后，把可编辑思维导图实时画出来](docs/assets/demo.gif)

> 输入一个目标 → Hermas 规划并调用工具 → 可编辑的思维导图在画布上生长。去 **[在线体验](https://mindgenius.onrender.com)** 试试。

## 它有什么不一样

**🤖 真正的智能体，不是套壳 prompt。** 大多数「AI 思维导图」工具只是「一次 prompt → markdown → 渲染」。Hermas 跑的是多步工具调用循环（Vercel AI SDK v5）：它自己决定去检索你上传的 PDF（`rag_query`）、生成导图结构（`mindmap_generate`）、扩展分支（`node_expand`）—— 自动串联，每一步都以可展开的工具卡片实时呈现（含输入/输出）。

**✏️ 它能对你正在做的图做外科手术式编辑。** 说一句「把定价分支改名」或「在市场分支下加一个竞品分析节点」，Hermas 就会调用 `mindmap_edit`，对你的实时画布发出精确的 `add`/`update`/`remove` 指令。它按节点 id 精准打补丁，而不是整图重画 —— 所以你手动的调整不会被冲掉，你能看着画布原地变化。

**📄 边画边读你的文档。** 在输入框点 📎 附加一份 PDF：上传 → 切块 → 向量化 → 内存向量索引，全程约 100 行代码，不依赖 LangChain。Hermas 会引用检索到的段落并融入导图。

**🔑 自带 Key，隐私自主。** OpenAI / Anthropic (Claude) / DeepSeek / Kimi (Moonshot) —— 或任意 OpenAI 兼容端点（在「设置」里填 base URL + 模型名，例如本地 Ollama 或自建网关），运行时可切换。Key 只存在你浏览器的 localStorage，每次请求发往*你自己的*后端 —— 服务端从不存储。

> ℹ️ DeepSeek 与 Kimi 不提供 embeddings 接口，所以在它们上面 PDF 检索（`rag_query`）会自动降级 —— 不影响导图生成。想在这些模型下保留 RAG，把 `EMBEDDING_API_KEY` 指向任意 OpenAI 兼容的 embeddings 端点即可（见 `apps/server/.env.example`）。

**🔁 重构但不破坏任何东西。** 技术栈从 Vue/Koa/LangChain 渐进式迁移到 React/Hono/AI SDK：旧的 SSE 信封 `{status, data}` 和所有旧接口依然可用 —— 智能体事件是叠加在既有协议（`packages/shared`）之内，而非另起炉灶。

**🎨 一块专注的工作台。** 对话面板 + 可编辑的 X6 画布 + 文档抽屉，同屏呈现。可增删改节点、对任意分支做 AI 头脑风暴、撤销/重做，并导出为 **PNG / SVG / Markdown / OPML**。导图与对话**刷新不丢**（localStorage），布局**自适应到平板**，界面**中英双语**。克制的暗色设计系统，零 UI 框架依赖（自定义 token 与组件，不用 antd）。

## 架构

```
├── apps/
│   ├── web/        # React 18 + Vite + Zustand + AntV X6（自定义设计系统）
│   └── server/     # Hono + Vercel AI SDK v5（Hermas 智能体、RAG、SSE 流式）
└── packages/
    └── shared/     # 两端共用的 SSE / 智能体事件协议
```

- **智能体循环**：`streamText` + `stopWhen: stepCountIs(8)`，四个 zod 强类型工具（`mindmap_generate` / `node_expand` / `rag_query` / `mindmap_edit`）
- **实时画布编辑**：`mindmap_edit` 产出结构化的 `add`/`update`/`remove` 指令，按节点 id 应用到现有树 —— 不整图重渲染，保留手动编辑
- **RAG**：pdf-parse → 重叠切块（含测试）→ `embedMany` → 余弦检索，进程内完成
- **多供应商**：每个请求从 `Authorization` / `X-LLM-Provider` / `X-LLM-Model` / `OpenAI-proxy` 请求头解析
- **CI**：每次 push 跑 lint → typecheck → test → build；支持 workspace 的 Docker 构建

完整设计见 [docs/REFACTOR_PLAN.md](docs/REFACTOR_PLAN.md)。

## 快速开始

环境要求：Node.js >= 20，pnpm >= 9

```bash
pnpm install
pnpm setup     # 交互式向导 —— 选供应商、粘贴 Key，自动生成 apps/server/.env
pnpm dev       # web 跑在 :5173，api 跑在 :3000
```

`pnpm setup` 是「不用碰配置文件」的路径：它会问你想用哪个模型供应商、你的 API Key，然后帮你生成 `apps/server/.env`。想手动配？把 `apps/server/.env.example` 复制成 `apps/server/.env` 再改即可。

> 🔑 你也可以在向导里跳过 Key，之后在应用右上角的**「设置」**里填 —— 在那里填的 Key 只存在浏览器的 localStorage。

### 一条命令跑起来（Docker）

整个应用打包成**一个镜像** —— server 会构建并一并托管 web 产物，没有任何需要手动接线的地方。无需 Node 工具链：

```bash
docker run -p 3000:3000 -e OPENAI_API_KEY=sk-... ghcr.io/xianjianlf2/mindgeniusai   # 然后打开 http://localhost:3000
```

或用 Compose 本地构建：

```bash
cp apps/server/.env.example apps/server/.env   # 或直接跑 `pnpm setup`
docker compose up --build   # 全部在 http://localhost:3000
```

也可以完全不填 Key，让每位访客在应用内「设置」里自带。

### 一键部署 demo（免费）

[![Deploy to Spaces](https://huggingface.co/datasets/huggingface/badges/resolve/main/deploy-to-spaces-lg.svg)](https://huggingface.co/new-space?sdk=docker&name=mindgenius)

在 Hugging Face Spaces 免费跑（Docker，16 GB 内存）。把 Space 指向本仓库的 `Dockerfile`，保留其 frontmatter `sdk: docker` / `app_port: 3000`，再把 `OPENAI_API_KEY` 设为 Space secret —— 或留空走「访客自带 Key」。

### 托管护栏（保护免费实例）

服务端自带护栏，免费托管也扛得住：单文件 ≤ `MAX_UPLOAD_MB`（默认 10MB）、最多索引 `MAX_INDEXED_DOCS` 篇（默认 20，超出淘汰最旧）、单篇 ≤ `MAX_CHUNKS_PER_DOC` 块。真不放心，设 `DISABLE_UPLOAD=true` 即可彻底关闭上传、纯画导图。配合**服务端 Key 留空**，你的 API 成本为零（embeddings/生成都记访客账上）。

### 使用统计（可选，零成本）

想知道有多少人用了 demo，又不想付 token 费、也不想破坏隐私承诺？因为访客自带 Key，你唯一的成本就是托管 —— 而统计同样能做到免费且无 cookie。在 web 构建环境里设置供应商即可（见 `apps/web/.env.example`）：

- **Umami Cloud / GoatCounter** —— 一个脚本同时统计页面浏览（PV/UV）**和**自定义事件 `agent_run`（有人真正生成了导图时触发）。想要「有效使用数」就用它。
- **Cloudflare Web Analytics** —— 和 Cloudflare Pages 天然搭配，但只统计浏览量（不支持自定义事件）。

只上报计数，绝不上报对话内容、PDF 或 API Key。不配置即静默 no-op。

## 脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm setup` | 交互式首次配置向导（生成 `apps/server/.env`） |
| `pnpm dev` | 并行运行 web + server |
| `pnpm build` | 类型检查并构建全部包 |
| `pnpm test` | 运行 vitest workspace |
| `pnpm lint` | eslint |

## 许可证

[MIT](LICENSE)

## Star 趋势

[![Star History Chart](https://api.star-history.com/svg?repos=xianjianlf2/MindGeniusAI&type=Date)](https://star-history.com/#xianjianlf2/MindGeniusAI&Date)
