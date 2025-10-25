import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: process.cwd(),
  resolve: {
    alias: {
      '@react-agendfy/core': resolve(__dirname, 'packages/core/src'),
      '@react-agendfy/plugin-export-pdf': resolve(__dirname, 'packages/plugins/export-pdf/src'),
      '@react-agendfy/plugin-export-reports': resolve(__dirname, 'packages/plugins/export-reports/src'),
      '@react-agendfy/plugin-google-calendar': resolve(__dirname, 'packages/plugins/google-calendar/src'),
      '@react-agendfy/plugin-theme': resolve(__dirname, 'packages/plugins/theme/src'),
      '@react-agendfy/plugin-timeline': resolve(__dirname, 'packages/plugins/timeline/src')
    }
  },
  server: {
    open: true,
    port: 3000
  }
});