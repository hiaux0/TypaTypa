import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import aurelia from "@aurelia/vite-plugin";

const fullReloadAlways = {
  name: "full-reload",
  handleHotUpdate({ server }) {
    server.ws.send({ type: "full-reload" });
    return [];
  },
};

export default defineConfig({
  server: {
    // open: !process.env.CI,
    open: false,
    port: 9000,
    host: true,
    hmr: true,
    watch: {
      usePolling: true,
    },
  },
  css: {
    devSourcemap: true,
  },
  esbuild: {
    target: "es2022",
  },
  //optimizeDeps: {
  //  esbuildOptions: {
  //    loader: {
  //      ".html": "text",
  //    },
  //  },
  //},
  optimizeDeps: {
    include: ["rangy"],
  },
  plugins: [
    aurelia({
      useDev: true,
      // include: "src/**/*.{ts,js,html}",
      // include: "src/**/*.ts",
    }),
    nodePolyfills(),
    fullReloadAlways,
    //{
    //  name: "full-reload",
    //  handleHotUpdate({ server }) {
    //    server.ws.send({ type: "full-reload" });
    //    return [];
    //  },
    //},
  ],
});
