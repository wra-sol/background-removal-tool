---
title: BG Remover API
emoji: 🖼️
colorFrom: blue
colorTo: indigo
sdk: docker
sdk_version: "latest"
app_file: app.py
pinned: false
---

# Hugging Face Space: Image Segmentation API

This is a FastAPI-based app for image segmentation, designed for deployment on Hugging Face Spaces.

## Usage

- **Endpoint:** `/segment`
- **Method:** POST
- **Request:** Multipart form with an image file (any format supported by PIL)
- **Response:** PNG image with transparency (segmentation mask applied)

### Example (using `curl`):

```bash
curl -X POST -F "file=@your_image.jpg" https://your-hf-space-url/segment --output result.png
```

## Deployment
- Place this directory in a Hugging Face Space (Python, FastAPI template).
- Ensure `requirements.txt` is present with all dependencies.

---

This app uses the BiRefNet model for image segmentation. 