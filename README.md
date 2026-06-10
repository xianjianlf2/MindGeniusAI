# MindGenius AI

Talk to **Hermas** — an autonomous agent that plans, retrieves your documents, and draws editable mind maps for you, with every tool call visible in real time.

![mindmap](https://github.com/xianjianlf2/MindGeniusAI/blob/main/markdownImg/newSample.png?raw=true)

## Why it's different

**🤖 A real agent, not a prompt wrapper.** Most "AI mind map" tools do a single prompt → markdown → render. Hermas runs a multi-step tool-calling loop (Vercel AI SDK v5): it decides on its own to search your uploaded PDF (`rag_query`), generate the map structure (`mindmap_generate`), and expand branches (`node_expand`) — chained automatically, with each step shown live as an expandable tool card (input/output included).

**📄 It reads your documents while drawing.** Attach a PDF from the composer (📎): upload → chunk → embed → in-memory vector index, all in ~100 lines without LangChain. Hermas cites retrieved passages and incorporates them into the map.

**🔑 Bring your own key, keep your privacy.** OpenAI / Anthropic (Claude) / DeepSeek, switchable at runtime. Keys live only in your browser's localStorage and are sent per-request to *your own* backend — never stored server-side. Custom gateway (base URL) supported.

**🔁 Rebuilt without breaking anything.** The stack was migrated from Vue/Koa/LangChain to React/Hono/AI SDK incrementally: the legacy SSE envelope `{status, data}` and every old endpoint still work — agent events are layered inside the existing protocol (`packages/shared`), not bolted on beside it.

**🎨 A focused single workbench.** Chat panel + editable X6 canvas + document drawer in one screen. Add/rename/delete nodes, AI-brainstorm any branch, undo/redo, export PNG. Dark, restrained design system with zero UI-framework dependency (custom tokens & components — no antd).

## Architecture

```
├── apps/
│   ├── web/        # React 18 + Vite + Zustand + AntV X6 (custom design system)
│   └── server/     # Hono + Vercel AI SDK v5 (Hermas agent, RAG, SSE streaming)
└── packages/
    └── shared/     # SSE / agent-event protocol shared by both ends
```

- **Agent loop**: `streamText` + `stopWhen: stepCountIs(8)`, tools defined with zod schemas
- **RAG**: pdf-parse → overlap chunking (tested) → `embedMany` → cosine retrieval, in-process
- **Multi-provider**: resolved per request from `Authorization` / `X-LLM-Provider` / `OpenAI-proxy` headers
- **CI**: lint → typecheck → test → build on every push; workspace-aware Docker builds

See [docs/REFACTOR_PLAN.md](docs/REFACTOR_PLAN.md) for the full design.

## Getting Started

Requirements: Node.js >= 20, pnpm >= 9

```bash
pnpm install

# configure the server
cp apps/server/.env.example apps/server/.env   # set OPENAI_API_KEY etc.

# start web (5173) + server (3000) together
pnpm dev
```

Or with Docker:

```bash
cp apps/server/.env.example apps/server/.env
docker compose up --build   # web on :8080, api on :3000
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | run web + server in parallel |
| `pnpm build` | typecheck & build all packages |
| `pnpm test` | run vitest workspace |
| `pnpm lint` | eslint |

## License

[MIT](LICENSE)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=xianjianlf2/MindGeniusAI&type=Date)](https://star-history.com/#xianjianlf2/MindGeniusAI&Date)
