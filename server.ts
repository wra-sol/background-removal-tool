import { Elysia } from "elysia";
import staticPlugin from '@elysiajs/static';
import { mkdirSync, unlinkSync } from "fs";

// Ensure upload dir exists
try { mkdirSync("uploads"); } catch {}

const app = new Elysia();

app
  .use(staticPlugin({ assets: 'public' }))
  .get("/", () => Bun.file("public/index.html"))
  .get("/attributions", () => Bun.file("public/attributions.html"))
  .post("/process", async ({ request, set }) => {
    const formData = await request.formData();
    const fileEntry = formData.get("image");
    if (!(fileEntry instanceof File)) {
      set.status = 400;
      return "No file uploaded";
    }
    const file = fileEntry;

    const inputPath = `uploads/${Date.now()}_${file.name}`;
    const outputPath = inputPath + ".png";
    await Bun.write(inputPath, file);

    // Call Python script
    const proc = Bun.spawn([
      "python3",
      "app.py",
      inputPath,
      outputPath
    ]);
    const exitCode = await proc.exited;

    if (exitCode !== 0) {
      unlinkSync(inputPath);
      set.status = 500;
      return "Processing failed";
    }

    const result = Bun.file(outputPath);
    set.headers["Content-Type"] = "image/png";
    set.headers["Content-Disposition"] = `inline; filename="result.png"`;
    set.headers["Cache-Control"] = "no-store";

    // Schedule cleanup
    setTimeout(() => {
      try { unlinkSync(inputPath); } catch {}
      try { unlinkSync(outputPath); } catch {}
    }, 10000);

    return result;
  })
  // Catch-all 404 handler (must be last)
  .all("/*", ({ set }) => {
    set.status = 404;
    return Bun.file("public/404.html");
  })
  .listen(3000);

console.log("Elysia server running at http://localhost:3000");