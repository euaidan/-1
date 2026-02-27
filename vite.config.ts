import tailwind from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    // 使用自定义域名，base改为根路径
    base: '/',
    
    plugins: [react(), tailwind()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // 在 AI Studio 中，通过 DISABLE_HMR 环境变量禁用 HMR。
      // 请勿修改—文件监视功能已禁用，以防止代理编辑期间出现闪烁。
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
