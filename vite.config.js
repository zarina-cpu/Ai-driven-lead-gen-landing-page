import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { leadApiPlugin } from "./server/leadApi.js";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, "");
  Object.assign(process.env, env);

  return {
    plugins: [react(), tailwindcss(), leadApiPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(rootDir, "src"),
      },
    },
  };
});
