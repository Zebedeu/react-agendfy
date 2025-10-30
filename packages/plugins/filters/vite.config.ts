import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  plugins: [
    react(), // Lida com a transformação JSX
    dts({ // Gera os arquivos de declaração de tipos (.d.ts)
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.tsx'),
      name: 'ReactAgendfyFilters',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      // Certifique-se de externalizar dependências que não devem ser empacotadas
      // no seu pacote
      external: ['react', 'react-dom', 'react/jsx-runtime', '@react-agendfy/core', 'lucide-react'],
      output: {
        // Forneça variáveis globais para usar na compilação UMD
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          '@react-agendfy/core': 'ReactAgendfyCore',
          'lucide-react': 'LucideReact',
        },
      },
    },
  },
});
