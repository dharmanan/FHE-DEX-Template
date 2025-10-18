

import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import inject from '@rollup/plugin-inject';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      inject({
        Buffer: ['buffer', 'Buffer'],
      })
    ],
    define: {
      'process.env': {},
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      __VITE_DEX_ADDRESS__: JSON.stringify(env.VITE_DEX_ADDRESS),
      __VITE_ZAMA_TOKEN_ADDRESS__: JSON.stringify(env.VITE_ZAMA_TOKEN_ADDRESS),
      __VITE_NETWORK_ID__: JSON.stringify(env.VITE_NETWORK_ID),
      __VITE_NETWORK_NAME__: JSON.stringify(env.VITE_NETWORK_NAME),
      __VITE_RPC_URL__: JSON.stringify(env.VITE_RPC_URL),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        buffer: 'buffer',
      }
    },
    optimizeDeps: {
      include: ['buffer'],
    },
    build: {
      minify: 'terser',
      target: 'es2020',
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ethers: ['ethers'],
          }
        }
      },
      chunkSizeWarningLimit: 1000,
    },
  };
});
