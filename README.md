# Background Removal Tool

Quickly remove the background from your images using a web interface powered by Bun, Elysia, and a Python backend leveraging the BiRefNet segmentation model.

---

## Features
- Upload or paste images to remove their background instantly
- Clean, responsive web UI
- Fast processing using [ZhengPeng7/BiRefNet](https://huggingface.co/ZhengPeng7/BiRefNet)
- Attributions and open source

---

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (for the server/frontend)
- [Python 3.8+](https://www.python.org/)
- Python dependencies (see below)

### Installation

1. **Install Bun dependencies:**
   ```sh
   bun install
   ```

2. **Install Python dependencies:**
   ```sh
   pip install -r requirements.txt
   ```

### Running the App

1. **Start the Bun server:**
   ```sh
   bun run server.ts
   ```
   The server will be available at [http://localhost:3000](http://localhost:3000)

2. **The server will automatically call the Python backend as needed.**

---

## Project Structure

- `server.ts` — Bun/Elysia server, static file serving, API endpoint
- `app.py` — Python backend for image background removal
- `public/` — Frontend assets (HTML, CSS, JS)
- `uploads/` — Temporary file storage

---

## Dependencies

### JavaScript/TypeScript
- [Bun](https://bun.sh/)
- [Elysia](https://elysiajs.com/)
- [@elysiajs/static](https://elysiajs.com/plugins/static)
- [multer](https://github.com/expressjs/multer) (for file handling)

### Python
- torch
- torchvision
- spaces
- pillow
- transformers
- loadimg
- pillow-heif

---

## Attributions
- Based on work by [not-lain](https://huggingface.co/not-lain)
- Powered by [ZhengPeng7/BiRefNet](https://huggingface.co/ZhengPeng7/BiRefNet)
- Some code and design inspired by [wra-sol/background-removal-tool](https://github.com/wra-sol/background-removal-tool)

---

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

All trademarks, service marks, and company names are the property of their respective owners.
