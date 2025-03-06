// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [react(), tailwindcss(),  dts({
    outputDir: 'dist/types',
    insertTypesEntry: true,
    exclude: [
      'src/App.tsx',
      'src/main.tsx'
    ],
    include: ['src/index.tsx']

  })],
  build: {
    lib: {
      entry: 'src/index.tsx', // ou src/index.ts, dependendo do seu arquivo
      name: 'react-agendfy',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});