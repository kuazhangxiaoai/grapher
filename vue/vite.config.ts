import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [vue(), tailwindcss()],
    base: env.VITE_API_BASE_URL,
    server: {
      port: 5173,
      open: true,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:8088',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '')
        }
      }
    },
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    build: {
      outDir: 'grapher_vue',
      assetsDir: 'assets',
    }
  }

});
