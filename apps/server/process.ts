import { Elysia } from "elysia";
import { unlinkSync } from "fs";

export const processRoute = new Elysia()
  .post("/process", async ({ request, set }) => {
    // Get the file from the request
    const formData = await request.formData();
    const fileEntry = formData.get("image");
    if (!(fileEntry instanceof File)) {
      set.status = 400;
      return "No file uploaded";
    }
    const file = fileEntry;

    const inputPath = `uploads/${Date.now()}_${file.name}`;
    await Bun.write(inputPath, file);

    // Prepare form data to send to Hugging Face Space
    const form = new FormData();
    form.append("file", await Bun.file(inputPath));

    // Call Hugging Face Space API
    const response = await fetch(`http://${process.env.HF_API_URL || "localhost:7860"}/segment`, {
      method: "POST",
      body: form,
    });

    // Clean up local file
    try { unlinkSync(inputPath); } catch {}

    if (!response.ok) {
      set.status = 500;
      return "Processing failed";
    }

    // Set headers and stream the result
    set.headers["Content-Type"] = "image/png";
    set.headers["Content-Disposition"] = `inline; filename=\"result.png\"`;
    set.headers["Cache-Control"] = "no-store";

    return response.body;
  });

