# Background Removal Tool

Remove image backgrounds in the browser using [BiRefNet](https://huggingface.co/ZhengPeng7/BiRefNet).

## Architecture

- **`apps/server`** — Elysia (Bun) web UI and upload proxy
- **`apps/hf-api`** — FastAPI segmentation service (`POST /segment`)

## Local development

```bash
npm install
cd apps/hf-api && pip install -r requirements.txt && uvicorn app:app --reload --port 7860
npm run dev:server
```

Open http://localhost:3000. The server calls the API at `http://127.0.0.1:7860/segment` by default.

Override the API with:

```bash
export HF_API_URL=http://127.0.0.1:7860
```

## Production (Railway)

Deployed automatically on push to `main` via Railway:

- **Front End** — `apps/server` (Bun, listens on `$PORT`)
- **Image Processor** — `apps/hf-api` (Docker + FastAPI)

Set `HF_API_URL` on the front-end service to the image processor's internal or public URL (host or full URL both work).

Live site: https://picbg.nathanielarfin.com/

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:server` | Hot-reload dev server |
| `npm run start:server` | Production server |
| `npm run typecheck` | TypeScript check |
