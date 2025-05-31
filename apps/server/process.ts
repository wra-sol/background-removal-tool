import { Elysia } from "elysia";
import { unlinkSync } from "fs";

export const processRoute = new Elysia()
  .post("/process", async ({ request, set }) => {
    // Get the file from the request
    const formData = await request.formData();
    console.log("[process.ts] Received form data");
    const fileEntry = formData.get("image");
    if (!(fileEntry instanceof File)) {
      set.status = 400;
      console.error("[process.ts] No file uploaded");
      return "No file uploaded";
    }
    const file = fileEntry;

    const inputPath = `uploads/${Date.now()}_${file.name}`;
    await Bun.write(inputPath, file);
    console.log(`[process.ts] File written to ${inputPath}`);

    // Prepare form data to send to Hugging Face Space
    const form = new FormData();
    form.append("file", await Bun.file(inputPath));
    console.log("[process.ts] Prepared form data for Hugging Face API");

    // Call Hugging Face Space API
    console.log(`[process.ts] Sending request to Hugging Face API at ${process.env.HF_API_URL || "localhost:7860"}/segment`);
    const response = await fetch(`${process.env.HF_API_URL || "localhost:7860"}/segment`, {
      method: "POST",
      body: form,
    });
    console.log(`[process.ts] Received response from Hugging Face API: ${response.status}`);

    // Clean up local file
    try { 
      unlinkSync(inputPath); 
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

