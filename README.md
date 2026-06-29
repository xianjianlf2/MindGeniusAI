# Tendril

> **Upload a document — an AI agent reads it and draws an editable mind map, live.**

<p>
  <a href="https://mindgenius.onrender.com"><img src="https://img.shields.io/badge/Live%20Demo-online-brightgreen?style=flat" alt="Live Demo" /></a>
  <a href="https://github.com/xianjianlf2/MindGeniusAI/actions/workflows/ci.yml"><img src="https://github.com/xianjianlf2/MindGeniusAI/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-BSL%201.1-blue.svg" alt="License: BSL 1.1" /></a>
  <a href="package.json"><img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen" alt="Node" /></a>
</p>

**English** · [简体中文](README.zh-CN.md)

Chat with **Hermas**, Tendril's AI agent that plans, reads your PDFs, and draws editable mind maps live — every tool call visible as it works.

Turn a dense paper, meeting notes, or a half-formed idea into a structured, editable mind map in seconds — then refine it by chatting or dragging nodes. Great for **students** summarizing papers, **researchers** mapping a field, and **PMs** breaking down a plan.

🔗 **[Try the live demo →](https://mindgenius.onrender.com)** · bring your own API key (stays in your browser). _First load may take ~30s to wake._ · ⭐ **Star it** if it's useful — it helps others find it.

![Tendril — Hermas plans, then draws an editable mind map live](docs/assets/demo.gif)

## ⚡️ Quick Start

```bash
pnpm install
pnpm setup     # pick a provider, paste a key → writes apps/server/.env
pnpm dev       # web on :5173, api on :3000
```

No key at setup? Skip it and paste one later in the app's **Settings** (top-right) — it stays in your browser only.

## ✨ Features

- 🤖 **Real agent, not a prompt wrapper** — multi-step tool loop (Vercel AI SDK v5) that decides when to search docs, generate the map, and expand branches, each shown as a live tool card.
- ✏️ **Surgical edits** — "rename the pricing branch" patches exact nodes by id, so your manual tweaks survive (no full re-render).
- 🤝 **Two-way canvas** — edit nodes by hand (rename, add, drag, delete) and Hermas sees *exactly what you changed* on your next message, then builds on it like a collaborator — not just the latest snapshot.
- 📄 **Reads your PDFs** — attach one or more PDFs (📎): chunk → embed → in-memory retrieval (~100 lines, no LangChain). `rag_query` searches across all attached docs at once.
- ⌨️ **Keyboard-first canvas** — `Tab` child · `Enter` sibling · `F2` rename · `Del` delete · `⌘Z` undo · **drag a node onto another to re-parent it**.
- ⌘ **Command palette (⌘K)** — Cursor-style overlay to fuzzy-search your saved maps + uploaded docs; `↵` opens a map or attaches a doc.
- 🔁 **Import / export** — import Markdown / OPML, export **PNG · SVG · Markdown · OPML · Mermaid**.
- 🔑 **Bring your own key** — OpenAI / Claude / DeepSeek / Kimi, or any OpenAI-compatible endpoint. Keys never touch the server's disk.
- 🎨 **One focused workbench** — chat + canvas + doc drawer; persists across refresh; bilingual (EN / 中文); dark, dependency-free UI.

## 🔧 Configure

`pnpm setup` writes `apps/server/.env` for you. To edit by hand, copy `apps/server/.env.example` → `apps/server/.env`.

| Provider | Embeddings (RAG) |
| --- | --- |
| OpenAI · Claude | ✅ full RAG |
| DeepSeek · Kimi | ⚠️ no embeddings — RAG auto-degrades; set `EMBEDDING_API_KEY` to any OpenAI-compatible endpoint to keep it on |

## 🚀 Docker

The whole app ships as **one image** (server serves the web bundle + API):

```bash
docker run -p 3000:3000 -e OPENAI_API_KEY=sk-... ghcr.io/xianjianlf2/mindgeniusai
# open http://localhost:3000
```

Or build locally: `cp apps/server/.env.example apps/server/.env && docker compose up --build`.

Omit the key to let each visitor bring their own from **Settings**.

[![Deploy to Spaces](https://huggingface.co/datasets/huggingface/badges/resolve/main/deploy-to-spaces-lg.svg)](https://huggingface.co/new-space?sdk=docker&name=mindgenius) — free on Hugging Face Spaces (Docker). Keep `sdk: docker` / `app_port: 3000`; set `OPENAI_API_KEY` as a secret or leave it empty.

## 🗂 Scripts

| Command | What it does |
| --- | --- |
| `pnpm setup` | first-run config wizard |
| `pnpm dev` | web + server in parallel |
| `pnpm build` | typecheck & build all packages |
| `pnpm test` | run vitest workspace |
| `pnpm lint` | eslint |

## 🏗 Architecture

```
apps/web/      React 18 + Vite + Zustand + AntV X6 (custom design system)
apps/server/   Hono + Vercel AI SDK v5 (Hermas agent, RAG, SSE streaming)
packages/shared/  SSE / agent-event protocol shared by both ends
```

- **Agent loop** — `streamText` + `stopWhen: stepCountIs(8)`, four zod-typed tools (`mindmap_generate` / `node_expand` / `rag_query` / `mindmap_edit`).
- **Live edits** — `mindmap_edit` returns `add`/`update`/`remove` ops applied to the tree by node id.
- **Two-way sync** — your manual canvas ops share that same op model; they're buffered (coalesced) and sent as `recentEdits` so the agent knows what *you* changed since its last turn, not just the current outline.
- **RAG** — pdf-parse → overlap chunking → `embedMany` → cosine retrieval, in-process.
- **Multi-provider** — resolved per request from request headers; keys never stored server-side.

Full design: [docs/REFACTOR_PLAN.md](docs/REFACTOR_PLAN.md).

## Analytics (optional)

Cookieless, count-only (page views + an `agent_run` event) via Umami / GoatCounter / Cloudflare. Never sends chat, PDFs, or keys. See `apps/web/.env.example`.

## License

[Business Source License 1.1](LICENSE). Free for personal, academic, research, and non-profit use. **Commercial use requires a license** — contact mark-xian@foxmail.com. Each version converts to Apache-2.0 four years after release (Change Date: 2030-06-29).

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=xianjianlf2/MindGeniusAI&type=Date)](https://star-history.com/#xianjianlf2/MindGeniusAI&Date)
</content>
</invoke>
