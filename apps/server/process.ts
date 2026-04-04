import { Elysia } from "elysia";
import { unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { uploadsDir } from "./paths";

function segmentEndpoint(): string {
  const raw = (process.env.HF_API_URL ?? "").trim();
  const base = (raw || "http://127.0.0.1:7860").replace(/\/+$/, "");
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(base)
    ? base
    : `http://${base}`;
  return `${withScheme}/segment`;
}

export const processRoute = new Elysia()
  .post("/process", async ({ request, set }) => {
    const formData = await request.formData();
    console.log("[process.ts] Received form data");
    const fileEntry = formData.get("image");
    if (!(fileEntry instanceof File)) {
      set.status = 400;
      console.error("[process.ts] No file uploaded");
      return "No file uploaded";
    }
    const file = fileEntry;

    const inputPath = join(uploadsDir, `${Date.now()}_${file.name}`);
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, buf);
    console.log(`[process.ts] File written to ${inputPath}`);

    const form = new FormData();
    form.append(
      "file",
      new Blob([buf], { type: file.type || "application/octet-stream" }),
      file.name || "upload"
    );
    console.log("[process.ts] Prepared form data for Hugging Face API");

    const segmentUrl = segmentEndpoint();
    console.log(`[process.ts] Sending request to Hugging Face API at ${segmentUrl}`);
    const response = await fetch(segmentUrl, {
      method: "POST",
      body: form,
    });
    console.log(`[process.ts] Received response from Hugging Face API: ${response.status}`);

    try {
      await unlink(inputPath);
      console.log(`[process.ts] Deleted local file ${inputPath}`);
    } catch (err) {
      console.error(`[process.ts] Error deleting file ${inputPath}:`, err);
    }

    if (!response.ok) {
      set.status = 500;
      console.error("[process.ts] Processing failed with status", response.status);
      return "Processing failed";
    }

    // Set headers and stream the result
    set.headers["Content-Type"] = "image/png";
    set.headers["Content-Disposition"] = `inline; filename=\"result.png\"`;
    set.headers["Cache-Control"] = "no-store";

    return response.body;
  });

