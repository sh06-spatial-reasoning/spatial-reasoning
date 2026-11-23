import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths({ projects: ['./tsconfig.app.json']})],
  optimizeDeps: {
    include: ['react-zoom-pan-pinch']
  },
  test: {
    browser: {
      provider: playwright(),
      headless: true,
      enabled: true,
      instances: [{ browser: 'firefox' }],
      viewport: {width: 1366, height: 768}
    }
  }
})
