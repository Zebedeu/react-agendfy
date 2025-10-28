import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    dts({
      outputDir: 'dist/types',
      insertTypesEntry: true,
      rollupTypes: true,
      copyDtsFiles: false,
    }),
  ],
  css: {
    // Garante que o CSS seja extraído apenas uma vez
    devSourcemap: false,
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'ReactAgendfyCore',
      fileName: 'index',
      formats: ['es', 'cjs'], // Gera ES + CJS
    },
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'esnext',
    emptyOutDir: true,
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
      ],
      output: [
        {
          format: 'es',
          entryFileNames: 'index.es.js',
          dir: 'dist',
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'jsxRuntime',
          },
          // Evita gerar CSS duplicado
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'style.css' || assetInfo.name === 'core.css') {
              return 'core.css'
            }
            return assetInfo.name
          },
        },
        {
          format: 'cjs',
          entryFileNames: 'index.cjs.js',
          dir: 'dist',
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'jsxRuntime',
          },
          exports: 'named',
           assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'style.css' || assetInfo.name === 'core.css') {
              return 'core.css'
            }
            return assetInfo.name
          },
        },
      ],
    },
  },
})
