# MindGenius AI

Auto generate MindMap with AI — now powered by **Hermas**, an autonomous agent that plans, calls tools, and draws the map for you.

![mindmap](https://github.com/xianjianlf2/MindGeniusAI/blob/main/markdownImg/newSample.png?raw=true)

## Features

- Single Hermas workbench: chat panel + mind-map canvas + sources drawer in one screen
- Hermas Agent: multi-step planning with live tool-call cards
  (generate mind map / expand node / search uploaded PDF, chained automatically)
- Edit the canvas: add/delete/rename nodes, AI brainstorm on any branch,
  undo/redo, zoom, fit screen, export PNG
- Attach a PDF from the composer (📎): upload → vector index → Hermas retrieves it
  via `rag_query` while drawing the map
- Multi-provider LLM: OpenAI / Anthropic (Claude) / DeepSeek — switch in the top bar,
  bring your own key & custom gateway; accent / density / node-style preferences

## Architecture

```
├── apps/
│   ├── web/        # React 18 + Vite + Zustand + Ant Design + AntV X6
│   └── server/     # Hono + Vercel AI SDK v5 (Hermas agent, RAG, SSE streaming)
└── packages/
    └── shared/     # SSE / agent-event protocol shared by both ends
```

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
