import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const serverRoot = __dirname;
export const publicDir = join(serverRoot, "public");
export const uploadsDir = join(serverRoot, "uploads");
