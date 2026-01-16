import { defineConfig, loadEnv, ConfigEnv, UserConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { createLogger } from 'vite';

// 自定义构建信息
const customLogger = createLogger('info', { 
  prefix: '[Grapher]',
  formatOptions: {
    date: true
  }
});

// https://vite.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd());
  
  // 构建开始时的自定义信息
  if (mode === 'production') {
    customLogger.info('🚀 开始构建 Grapher 项目...');
    customLogger.info('📦 正在优化代码和资源...');
  }
  
  return {
    plugins: [
      vue(), 
      tailwindcss(),
      // 构建完成后的自定义插件
      {
        name: 'custom-build-info',
        closeBundle() {
          if (mode === 'production') {
            customLogger.info('✅ 构建完成！');
            customLogger.info('✨ 项目已成功打包到 grapher_vue 目录');
            customLogger.info('🎯 准备部署或使用构建后的文件');
          }
        }
      }
    ],
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
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // 去掉 console 输出
          drop_debugger: true, // 去掉 debugger
          pure_funcs: ['console.log', 'console.warn', 'console.error'], // 移除特定的 console 函数
        },
        format: {
          comments: false, // 去掉注释
        },
      },
    }
  }
});
