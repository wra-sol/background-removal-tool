import { Elysia } from "elysia";
import node from "@elysiajs/node";
import staticPlugin from "@elysiajs/static";
import { mkdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { publicDir, uploadsDir } from "./paths";
import { processRoute } from "./process";

try {
  mkdirSync(uploadsDir, { recursive: true });
} catch {}

const isBun = typeof Bun !== "undefined" && !!Bun.file;
const app = new Elysia(isBun ? {} : { adapter: node() });

app
  .use(staticPlugin({ assets: publicDir }))
  .get("/", async ({ set }) => {
    set.headers["content-type"] = "text/html; charset=utf-8";
    return readFile(join(publicDir, "index.html"), "utf-8");
  })
  .get("/attributions", async ({ set }) => {
    set.headers["content-type"] = "text/html; charset=utf-8";
    return readFile(join(publicDir, "attributions.html"), "utf-8");
  })
  .use(processRoute)
  // Catch-all 404 handler (must be last)
  .all("/*", async ({ set }) => {
    set.status = 404;
    set.headers["content-type"] = "text/html; charset=utf-8";
    return readFile(join(publicDir, "404.html"), "utf-8");
  })
  .listen(3000);

console.log("Elysia server running at http://localhost:3000");
