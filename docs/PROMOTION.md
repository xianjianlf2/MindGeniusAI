# Promotion kit

A ready-to-use launch checklist + copy for getting Tendril in front of people.
Primary wedge: **a self-hostable, privacy-first document-aware mind-map agent — your
files and API key never leave your machine.** Lead every channel with self-host +
privacy; the "real agent / live tool calls" angle is the demo hook, not the headline.
Audience priority: self-hosters, privacy-conscious knowledge workers, and teams with
sensitive docs — *not* students (they won't pay, and the BSL license makes them free
by design). Let the shareable artifact + demo GIF pull students in as a free top-of-funnel.

## 0. Prerequisites (do these first — they gate everything else)

- [ ] **Ship a Live Demo.** A clickable URL converts far better than any copy. You already
      have `render.yaml`, root `Dockerfile`, and the HF Spaces button — deploy one and
      replace `Live demo: _coming soon_` in `README.md` with the real URL.
- [ ] **Capture the demo GIF + hero screenshot** (see `docs/assets/README.md`) and embed
      them at the top of the README. No-media AI repos get scrolled past.
- [ ] **Set the GitHub repo metadata** (see §3).

## 1. One-liners (reuse everywhere)

- **Short:** A self-hostable AI agent that turns your PDFs into editable mind maps —
  your files and key never leave your machine. One Docker command.
- **Tweet-length:** Every "AI mind map" tool wants to upload your documents to its cloud.
  Tendril runs the whole thing on your box: a real tool-calling agent reads your PDF,
  builds the map, and edits exact nodes live — BYO key (stays in your browser), one-image
  Docker, source-available.
- **Tagline:** Your documents in, an editable mind map out — on infrastructure you control.

## 2. Channel-specific copy

### Hacker News — "Show HN"
> **Show HN: Tendril – a self-hostable, document-aware mind-map agent (your files stay local)**
>
> Most "AI mind map" tools are cloud SaaS: you upload your documents to their servers and
> your model key lives in their backend. Tendril runs entirely on infrastructure you
> control — one Docker image, BYO key (stays in your browser, sent only to your own
> backend), nothing written to the server's disk.
>
> Inside, an agent (Hermas) plans, retrieves from your uploaded PDF, and renders an
> editable mind map — each tool call shown as an expandable card. Unlike one-shot
> "prompt → markdown" tools, it runs a multi-step tool-calling loop (Vercel AI SDK v5)
> and edits the *existing* canvas surgically (add/rename/remove a node by id) instead of
> regenerating it. RAG is ~100 lines, no LangChain.
>
> Source-available (BSL 1.1 — free for non-commercial use, converts to Apache-2.0 in 2030).
> Stack: React + Hono + AI SDK v5 + AntV X6. Demo: <URL>. Repo: <URL>.

Post Tue–Thu, ~8–10am ET. Reply to every comment in the first 2 hours.

### Product Hunt
- **Name:** Tendril
- **Tagline:** Self-hostable AI mind-map agent — your docs and key never leave your machine
- **First comment:** the "why it's different" framing — self-host + privacy first, then
  real agent vs prompt wrapper, live `mindmap_edit`, BYO-key. Link the demo.
- Line up a few people to try the demo on launch morning.

### Reddit (priority order — privacy/self-host crowd first, they drive stars)
- **r/selfhosted** (top priority) — lead with "one Docker image, BYO key, nothing stored
  server-side, your documents never leave your box."
- **r/LocalLLaMA** — lead with multi-provider + custom gateway/base-URL (works with a fully
  local OpenAI-compatible endpoint, so docs + inference can both stay on-prem).
- r/privacy, r/datahoarder — privacy angle: turn your archive into maps without uploading it.
- r/artificial, r/SideProject — softer, lead with the demo GIF (top-of-funnel, lower intent).

### Chinese communities
- **V2EX（/go/selfhosted、/go/create）/ 掘金 / 少数派** — 用 `README.zh-CN.md` 的定位，开头先打
  **自托管 + 隐私**：文档不出你的机器、Key 只在浏览器、一条 Docker 命令；再讲真·Agent（规划→检索→
  画图→增量编辑）。附 demo GIF 与在线地址。
- **NAS / 自托管圈（恩山、什么值得买玩家、Telegram 自托管群）** — 主打"把你本地的资料/PDF 归档变成
  可编辑导图，全程不上传"。
- **微信公众号 / 即刻** — 短视频版 demo（生成 + 文档检索 + 实时增量编辑那一刻），结尾点一句私密自托管。

### Dev.to / personal blog
Write the build story: "Migrating a Vue/Koa/LangChain app to React/Hono/AI SDK v5 without
breaking the old SSE protocol" — links back to the repo and `docs/REFACTOR_PLAN.md`.

## 3. GitHub repo metadata (1-minute, high-leverage SEO)

- **Description:** `Self-hostable AI agent that turns your documents into editable mind maps — your files and key never leave your machine. BYO key, one Docker image, source-available.`
- **Topics:** `self-hosted`, `privacy`, `local-first`, `bring-your-own-key`, `ai-agent`,
  `mindmap`, `mind-map`, `rag`, `llm`, `vercel-ai-sdk`, `openai`, `claude`, `deepseek`,
  `react`, `hono`, `typescript`, `antv-x6`, `docker`
- **Social preview image:** Settings → General → upload `docs/assets/hero.png`
  (this is the card people see when the link is shared).
- Enable Discussions; pin a "Show us your maps" thread.

## 4. After launch

- Add a "Live demo" badge and a star-count callout to the README.
- Collect the best user-made maps into a small gallery in `docs/assets/`.
- Note any provider/base-URL combos people ask for and document them.
