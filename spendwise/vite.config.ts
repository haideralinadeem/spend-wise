import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_BASE_PATH is "/" locally and "/your-repo-name/" on GitHub Pages.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [react()],
  }
})
