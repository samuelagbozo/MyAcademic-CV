import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { env } from 'node:process'
import { createSummaryApi } from './server/generateSummary.js'

function geminiSummaryPlugin() {
  return {
    name: 'gemini-summary-api',
    configResolved(config) {
      const variables = loadEnv(config.mode, config.envDir, '')
      if (!env.GEMINI_API_KEY && variables.GEMINI_API_KEY) env.GEMINI_API_KEY = variables.GEMINI_API_KEY
      if (!env.GEMINI_MODEL && variables.GEMINI_MODEL) env.GEMINI_MODEL = variables.GEMINI_MODEL
    },
    configureServer(server) {
      server.middlewares.use(createSummaryApi())
    },
    configurePreviewServer(server) {
      server.middlewares.use(createSummaryApi())
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), geminiSummaryPlugin()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  ssr: {
    noExternal: ['@clerk/react-router'],
  },
})