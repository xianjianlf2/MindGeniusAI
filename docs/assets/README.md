# Demo assets

Drop marketing media here, then reference it from the root `README.md`.

## What to capture (priority order)

1. **`hero.png`** — first-screen screenshot of the workbench with a finished, colorful
   mind map on the canvas + a couple of tool cards visible in the chat panel.
   This is the README hero and the GitHub social-preview image. Target ~1600×900.
2. **`demo.gif`** (or `demo.mp4`) — a 25–35s screen recording of the full loop:
   1. Type a goal in the composer (or click an example card).
   2. Watch the `mindmap_generate` tool card stream and the map grow on the canvas.
   3. Attach a PDF (📎) and ask a question → `rag_query` tool card cites passages.
   4. Say "add a competitor-analysis node under Market" → `mindmap_edit` patches the
      canvas in place (the key differentiator — make sure this moment is in frame).
3. **`tool-card.png`** — close-up of one expanded tool card showing input/output JSON.

## Tips

- Use the dark theme; the design system is built for it.
- Record at 2× (retina) then downscale — keeps text crisp.
- Keep the GIF under ~8 MB so it loads inline on GitHub. `ffmpeg` + `gifski` gives the
  best size/quality, or export an `.mp4` and let GitHub render the `<video>`.
- Strip any real API keys / private document content before publishing.

## Embed snippet (paste into root README once assets exist)

```md
![MindGenius AI — Hermas workbench](docs/assets/hero.png)

![Hermas generating and editing a mind map live](docs/assets/demo.gif)
```
