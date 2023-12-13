import { unstable_vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
    }),
  ],
  ssr: {
    external: ["@heroicons/react/24/solid", "@heroicons/react/24/outline"],
  }
});
