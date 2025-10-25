import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // garante resolução local do core durante desenvolvimento
      '@react-agendfy/core': resolve(__dirname, '../../packages/core/src')
    }
  },
  server: { port: 5173 }
});