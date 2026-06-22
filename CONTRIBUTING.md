# Contributing to MindGeniusAI

Thanks for your interest in contributing! 🎉 Issues, ideas, and pull requests are all welcome.

## Getting started

Requirements: **Node.js >= 20**, **pnpm >= 9**

```bash
pnpm install
cp apps/server/.env.example apps/server/.env   # set OPENAI_API_KEY etc.
pnpm dev                                        # web :5173 + server :3000
```

This is a pnpm workspace monorepo:

```
apps/web/        # React + Vite frontend
apps/server/     # Hono + Vercel AI SDK backend (agent, RAG, SSE)
packages/shared/ # SSE / agent-event protocol shared by both ends
```

## Before opening a pull request

Run the same checks CI runs — all must pass:

```bash
pnpm lint        # eslint
pnpm build       # typecheck + build all packages
pnpm test        # vitest workspace
```

## Pull request guidelines

- **Branch** from `main` and keep PRs focused on a single change.
- **Commits** follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
- **Describe** what changed and why; link the related issue (`Closes #123`).
- For protocol or agent-event changes, update `packages/shared` so both ends stay in sync, and note it in the PR.
- Add or update tests when you change behavior.

## Reporting bugs

Open an issue with: what you expected, what happened, steps to reproduce, and your environment (OS, Node version, provider). A minimal reproduction helps a lot.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
