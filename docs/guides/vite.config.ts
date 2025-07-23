import { defineConfig } from "vite";
import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mdx()],
});
