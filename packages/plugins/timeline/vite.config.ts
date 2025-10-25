import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({ 
      insertTypesEntry: true,
      skipDiagnostics: false,
      rollupTypes: true
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'PluginTimeline',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm.js' : 'js'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@react-agendfy/core'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@react-agendfy/core': 'ReactAgendfy'
        }
      }
    },
    sourcemap: true
  }
});