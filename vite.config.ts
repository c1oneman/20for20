import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["shader-art", "@shader-art/plugin-uniform"],
  },
  build: {
    commonjsOptions: {
      include: [/shader-art/, /@shader-art\/plugin-uniform/],
    },
  },
  assetsInclude: ["**/*.json"],
});
