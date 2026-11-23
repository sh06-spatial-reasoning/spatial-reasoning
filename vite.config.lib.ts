import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tsconfigPaths({ projects: ['./tsconfig.app.json']})],
  define: {
    'process.env': { NODE_ENV: 'production' }
  },
  publicDir: 'embed',
  build: {
    outDir: 'dist/embed',
    lib: {
      entry: resolve(__dirname, 'src/lib.tsx'),
      name: 'isometric-drawing'
    },
    rollupOptions: {
      external: [
        // export buttons dependencies
        'canvg', '@zip.js/zip.js',
        'react',
        // 3-dimensional viewport dependencies
        '@react-three/drei', '@react-three/fiber', 'three'
      ],
      output: {
        globals: {
          'react': 'react',
          '@react-three/drei': '@react-three/drei',
          '@react-three/fiber': '@react-three/fiber',
          'three': 'three'
        }
      }
    }
  }
})
