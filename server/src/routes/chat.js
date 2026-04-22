import { Router } from 'express'
import pool from '../db/connection.js'
import { streamChat } from '../services/ollama.js'

const router = Router()

router.post('/', async (req, res) => {
  const { conversation_id, content, model = 'llama3' } = req.body

  if (!conversation_id || !content) {
    return res.status(400).json({ error: 'conversation_id and content required' })
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    await pool.query(
      `INSERT INTO messages (conversation_id, role, content, model)
       VALUES ($1, 'user', $2, $3)`,
      [conversation_id, content, model]
    )

    const historyResult = await pool.query(
      `SELECT role, content FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversation_id]
    )

    const conv = await pool.query(
      'SELECT system_prompt FROM conversations WHERE id = $1',
      [conversation_id]
    )

    const messages = []
    if (conv.rows[0]?.system_prompt) {
      messages.push({ role: 'system', content: conv.rows[0].system_prompt })
    }
    messages.push(...historyResult.rows)

    let fullResponse = ''

    const send = (token, done) => {
      res.write(`data: ${JSON.stringify({ token, done })}\n\n`)
      if (done) res.end()
    }

    fullResponse = await streamChat(model, messages, send, req.signal)

    if (fullResponse) {
      await pool.query(
        `INSERT INTO messages (conversation_id, role, content, model)
         VALUES ($1, 'assistant', $2, $3)`,
        [conversation_id, fullResponse, model]
      )

      const msgCount = await pool.query(
        'SELECT COUNT(*) FROM messages WHERE conversation_id = $1',
        [conversation_id]
      )

      if (parseInt(msgCount.rows[0].count) <= 2) {
        const titleWords = content.slice(0, 50)
        await pool.query(
          `UPDATE conversations SET title = $1, updated_at = NOW() WHERE id = $2`,
          [titleWords, conversation_id]
        )
      } else {
        await pool.query(
          `UPDATE conversations SET updated_at = NOW() WHERE id = $1`,
          [conversation_id]
        )
      }
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      res.write(`data: ${JSON.stringify({ error: err.message, done: true })}\n\n`)
      res.end()
    }
  }
})

export default router
