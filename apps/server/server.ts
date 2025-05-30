import { Elysia } from "elysia";
import staticPlugin from "@elysiajs/static";
import { mkdirSync, unlinkSync } from "fs";
import { processRoute } from "./process";

// Ensure upload dir exists
try {
  mkdirSync("uploads");
} catch {}

const app = new Elysia();

app
  .use(staticPlugin({ assets: "public" }))
  .get("/", () => Bun.file("public/index.html"))
  .get("/attributions", () => Bun.file("public/attributions.html"))
  .use(processRoute)
  // Catch-all 404 handler (must be last)
  .all("/*", ({ set }) => {
    set.status = 404;
    return Bun.file("public/404.html");
  })
  .listen(3000);

console.log("Elysia server running at http://localhost:3000");
