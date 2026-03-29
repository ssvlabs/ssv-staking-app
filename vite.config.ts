import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  if (!env.VITE_SSV_NETWORKS) {
    console.error("VITE_SSV_NETWORKS is not defined in .env");
  }

  return {
    build: {
      target: "es2022",
      outDir: "build",
      sourcemap: true
    },
    server: {
      port: 3000,
      open: true
    },
    plugins: [
      react(),
      nodePolyfills({
        globals: {
          Buffer: mode === "production"
        }
      })
    ],
    define: {
      ...(mode === "development" ? { global: {} } : undefined)
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
        "@react-native-async-storage/async-storage": path.resolve(
          __dirname,
          "lib/empty-module.ts"
        ),
        "pino-pretty": path.resolve(__dirname, "lib/empty-module.ts")
      }
    }
  };
});
