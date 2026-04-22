import { Router } from 'express'
import pool from '../db/connection.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM conversations ORDER BY updated_at DESC'
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  const { title = 'New Chat', model = 'llama3', system_prompt } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO conversations (title, model, system_prompt)
       VALUES ($1, $2, $3) RETURNING *`,
      [title, model, system_prompt]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const conv = await pool.query(
      'SELECT * FROM conversations WHERE id = $1',
      [req.params.id]
    )
    if (!conv.rows.length) return res.status(404).json({ error: 'Not found' })

    const messages = await pool.query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [req.params.id]
    )
    res.json({ ...conv.rows[0], messages: messages.rows })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id', async (req, res) => {
  const { title, model, system_prompt } = req.body
  try {
    const result = await pool.query(
      `UPDATE conversations
       SET title = COALESCE($1, title),
           model = COALESCE($2, model),
           system_prompt = COALESCE($3, system_prompt),
           updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [title, model, system_prompt, req.params.id]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM conversations WHERE id = $1', [req.params.id])
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Generate or return existing share token
router.post('/:id/share', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE conversations
       SET share_token = COALESCE(share_token, gen_random_uuid())
       WHERE id = $1 RETURNING share_token`,
      [req.params.id]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' })
    res.json({ token: result.rows[0].share_token })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id/messages/from/:msgId', async (req, res) => {
  try {
    const msg = await pool.query(
      'SELECT created_at FROM messages WHERE id = $1 AND conversation_id = $2',
      [req.params.msgId, req.params.id]
    )
    if (!msg.rows.length) return res.status(404).json({ error: 'Not found' })
    await pool.query(
      'DELETE FROM messages WHERE conversation_id = $1 AND created_at >= $2',
      [req.params.id, msg.rows[0].created_at]
    )
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
