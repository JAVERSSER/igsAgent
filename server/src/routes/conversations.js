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

export default router
