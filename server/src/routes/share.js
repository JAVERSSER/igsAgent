import { Router } from 'express'
import pool from '../db/connection.js'

const router = Router()

// GET /api/share/:token — public read-only view
router.get('/:token', async (req, res) => {
  try {
    const conv = await pool.query(
      'SELECT id, title, model, created_at FROM conversations WHERE share_token = $1',
      [req.params.token]
    )
    if (!conv.rows.length) return res.status(404).json({ error: 'Not found' })

    const messages = await pool.query(
      'SELECT id, role, content, created_at FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conv.rows[0].id]
    )
    res.json({ ...conv.rows[0], messages: messages.rows })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
