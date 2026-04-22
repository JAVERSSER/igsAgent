import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { runMigrations } from './db/migrations.js'
import chatRouter from './routes/chat.js'
import conversationsRouter from './routes/conversations.js'
import modelsRouter from './routes/models.js'
import improveRouter from './routes/improve.js'
import shareRouter from './routes/share.js'
import uploadRouter from './routes/upload.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/chat', chatRouter)
app.use('/api/conversations', conversationsRouter)
app.use('/api/models', modelsRouter)
app.use('/api/improve', improveRouter)
app.use('/api/share', shareRouter)
app.use('/api/upload', uploadRouter)

async function start() {
  try {
    await runMigrations()
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

start()
