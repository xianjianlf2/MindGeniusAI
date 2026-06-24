# Promotion kit

A ready-to-use launch checklist + copy for getting MindGenius AI in front of people.
Edit the angle to taste, but the positioning is consistent: **a real document-aware
agent that draws and edits mind maps live, bring-your-own-key, self-hostable, MIT.**

## 0. Prerequisites (do these first — they gate everything else)

- [ ] **Ship a Live Demo.** A clickable URL converts far better than any copy. You already
      have `render.yaml`, root `Dockerfile`, and the HF Spaces button — deploy one and
      replace `Live demo: _coming soon_` in `README.md` with the real URL.
- [ ] **Capture the demo GIF + hero screenshot** (see `docs/assets/README.md`) and embed
      them at the top of the README. No-media AI repos get scrolled past.
- [ ] **Set the GitHub repo metadata** (see §3).

## 1. One-liners (reuse everywhere)

- **Short:** Talk to an AI agent that reads your PDFs and draws editable mind maps —
  bring your own key, self-host in one Docker command.
- **Tweet-length:** Most "AI mind map" tools are one prompt → markdown. MindGenius runs a
  real tool-calling agent: it searches your uploaded PDF, builds the map, and edits exact
  nodes live — every step visible. BYO key, MIT, one-image Docker.
- **Tagline:** Your documents in, an editable mind map out — with the agent's work shown live.

## 2. Channel-specific copy

### Hacker News — "Show HN"
> **Show HN: MindGenius AI – a document-aware agent that draws and edits mind maps live**
>
> It's an open-source (MIT) workbench where an agent (Hermas) plans, retrieves from your
> uploaded PDF, and renders an editable mind map — each tool call shown as an expandable
> card. Unlike one-shot "prompt → markdown" tools, it runs a multi-step tool-calling loop
> (Vercel AI SDK v5) and can edit the *existing* canvas surgically (add/rename/remove a
> node by id) instead of regenerating it.
>
> Bring your own OpenAI/Claude/DeepSeek key — it stays in your browser and is sent only to
> your own backend. RAG is ~100 lines, no LangChain. Whole app ships as one Docker image.
>
> Stack: React + Hono + AI SDK v5 + AntV X6. Demo: <URL>. Repo: <URL>.

Post Tue–Thu, ~8–10am ET. Reply to every comment in the first 2 hours.

### Product Hunt
- **Name:** MindGenius AI
- **Tagline:** An AI agent that reads your docs and draws editable mind maps
- **First comment:** the "why it's different" framing — real agent vs prompt wrapper,
  live `mindmap_edit`, BYO-key privacy, one-command self-host. Link the demo.
- Line up a few people to try the demo on launch morning.

### Reddit
- r/selfhosted — lead with "one Docker image, BYO key, nothing stored server-side."
- r/LocalLLaMA — lead with multi-provider + custom gateway/base-URL support.
- r/artificial, r/SideProject — lead with the demo GIF.

### Chinese communities
- **掘金 / 少数派 / V2EX** — 用 `README.zh-CN.md` 的定位：真·Agent（规划→检索→画图→增量编辑）、
  自带 Key 隐私、一条 Docker 命令自托管。附 demo GIF 与在线地址。
- **微信公众号 / 即刻** — 短视频版 demo（生成 + 联网/文档检索 + 实时增量编辑那一刻）。

### Dev.to / personal blog
Write the build story: "Migrating a Vue/Koa/LangChain app to React/Hono/AI SDK v5 without
breaking the old SSE protocol" — links back to the repo and `docs/REFACTOR_PLAN.md`.

## 3. GitHub repo metadata (1-minute, high-leverage SEO)

- **Description:** `An AI agent that reads your documents and draws editable mind maps live — bring your own key, self-hostable, MIT.`
- **Topics:** `ai-agent`, `mindmap`, `mind-map`, `rag`, `llm`, `vercel-ai-sdk`,
  `openai`, `claude`, `deepseek`, `react`, `hono`, `typescript`, `antv-x6`,
  `self-hosted`, `bring-your-own-key`
- **Social preview image:** Settings → General → upload `docs/assets/hero.png`
  (this is the card people see when the link is shared).
- Enable Discussions; pin a "Show us your maps" thread.

## 4. After launch

- Add a "Live demo" badge and a star-count callout to the README.
- Collect the best user-made maps into a small gallery in `docs/assets/`.
- Note any provider/base-URL combos people ask for and document them.
