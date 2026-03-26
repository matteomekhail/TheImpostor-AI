import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { Plugin } from 'vite'

// In-memory state for local dev (replaces KV)
let gameState: string | null = null
const gameHistory: unknown[] = []

function apiProxy(): Plugin {
  let apiKey = ''

  return {
    name: 'api-proxy',
    configResolved(config) {
      const env = loadEnv(config.mode, config.root, '')
      apiKey = env.OPENROUTER_API_KEY || ''
    },
    configureServer(server) {
      // OpenRouter chat proxy
      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }

        const chunks: Buffer[] = []
        for await (const chunk of req) {
          chunks.push(chunk as Buffer)
        }
        const body = JSON.parse(Buffer.concat(chunks).toString())

        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://impostor.matteomekhail.dev',
            },
            body: JSON.stringify({
              model: body.model,
              messages: body.messages,
              temperature: body.temperature ?? 0.7,
              max_tokens: body.max_tokens ?? 300,
            }),
          })

          if (!response.ok) {
            const errorText = await response.text()
            res.statusCode = response.status
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: `OpenRouter: ${response.status}`, details: errorText }))
            return
          }

          const data = await response.json() as { choices: { message: { content: string } }[] }
          const content = data.choices?.[0]?.message?.content?.trim() ?? ''

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ content }))
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: String(err) }))
        }
      })

      // Game state — GET
      server.middlewares.use('/api/state', (req, res, next) => {
        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ state: gameState ? JSON.parse(gameState) : null }))
          return
        }

        if (req.method === 'PUT') {
          const chunks: Buffer[] = []
          req.on('data', (chunk: Buffer) => chunks.push(chunk))
          req.on('end', () => {
            const body = JSON.parse(Buffer.concat(chunks).toString())
            gameState = JSON.stringify(body.state)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          })
          return
        }

        next()
      })

      // Game history
      server.middlewares.use('/api/history', (req, res, next) => {
        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ history: gameHistory }))
          return
        }

        if (req.method === 'POST') {
          const chunks: Buffer[] = []
          req.on('data', (chunk: Buffer) => chunks.push(chunk))
          req.on('end', () => {
            const body = JSON.parse(Buffer.concat(chunks).toString())
            gameHistory.unshift(body.game)
            if (gameHistory.length > 50) gameHistory.length = 50
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          })
          return
        }

        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiProxy()],
})
