import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { env } from 'node:process'
import { createAiApi } from './server/generateSummary.js'

function aiApiPlugin() {
  return {
    name: 'ai-api',
    configResolved(config) {
      const variables = loadEnv(config.mode, config.envDir, '')
      if (!env.DEEPSEEK_API_KEY && variables.DEEPSEEK_API_KEY) env.DEEPSEEK_API_KEY = variables.DEEPSEEK_API_KEY
      if (!env.DEEPSEEK_MODEL && variables.DEEPSEEK_MODEL) env.DEEPSEEK_MODEL = variables.DEEPSEEK_MODEL
    },
    configureServer(server) {
      server.middlewares.use(createAiApi())
    },
    configurePreviewServer(server) {
      server.middlewares.use(createAiApi())
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), aiApiPlugin()],
  base: '/',

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  ssr: {
    noExternal: ['@clerk/react-router'],
  },
})