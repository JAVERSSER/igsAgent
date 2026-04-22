import { Router } from 'express'
import { getModels } from '../services/ollama.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const data = await getModels()
    res.json(data)
  } catch (err) {
    res.status(503).json({ error: 'Ollama not available', details: err.message })
  }
})

export default router
