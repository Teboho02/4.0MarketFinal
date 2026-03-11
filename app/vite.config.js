import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
  server: {
    port: 5000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
