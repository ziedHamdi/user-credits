import { resolve } from "path";
import { defineConfig } from "vite";
import dtsPlugin from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
    },
    target: "es2020",
  },
  plugins: [
    dtsPlugin({
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    alias: {
      src: resolve("src/"),
    },
  },
});
