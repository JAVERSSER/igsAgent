import { Router } from 'express'
import { streamChat } from '../services/ollama.js'

const router = Router()

router.post('/', async (req, res) => {
  const { text, model = 'llama3' } = req.body
  if (!text) return res.status(400).json({ error: 'text required' })

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const messages = [
    {
      role: 'system',
      content: 'You are a grammar and writing assistant. When given text, return ONLY the improved version with better grammar, clarity, and sentence structure. Do not add explanations, do not say "Here is the improved version", just return the corrected text directly.',
    },
    {
      role: 'user',
      content: `Improve the grammar and sentences of this text:\n\n${text}`,
    },
  ]

  try {
    await streamChat(model, messages, (token, done) => {
      res.write(`data: ${JSON.stringify({ token, done })}\n\n`)
      if (done) res.end()
    }, req.signal)
  } catch (err) {
    if (err.name !== 'AbortError') {
      res.write(`data: ${JSON.stringify({ error: err.message, done: true })}\n\n`)
      res.end()
    }
  }
})

export default router
