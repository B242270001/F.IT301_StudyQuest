import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://localhost:4000' },
  },
  test: {
    environment: 'jsdom',
    include: ['frontend/**/*.test.{js,jsx}'],
    setupFiles: ['frontend/tests/setup.js'],
  },
})
