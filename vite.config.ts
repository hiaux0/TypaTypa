import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import aurelia from "@aurelia/vite-plugin";

export default defineConfig({
  server: {
    open: !process.env.CI,
    port: 9000,
    host: true,
  },
  esbuild: {
    target: "es2022",
  },
  plugins: [
    aurelia({
      useDev: true,
    }),
    nodePolyfills(),
  ],
});
