import { Router } from 'express'
import multer from 'multer'
import { createRequire } from 'module'
import pool from '../db/connection.js'

const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')
const mammoth = require('mammoth')

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } })

async function extractText(buffer, mimetype, filename) {
  if (mimetype === 'application/pdf' || filename.endsWith('.pdf')) {
    const data = await pdfParse(buffer)
    return data.text
  }

  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    filename.endsWith('.docx')
  ) {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  if (
    mimetype.startsWith('text/') ||
    filename.match(/\.(txt|csv|json|md|js|ts|py|html|css|xml)$/)
  ) {
    return buffer.toString('utf-8')
  }

  return null
}

function chunkText(text, chunkSize = 800, overlap = 100) {
  const chunks = []
  let i = 0
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize))
    i += chunkSize - overlap
  }
  return chunks
}

async function getEmbedding(text) {
  try {
    const res = await fetch('http://localhost:11434/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'nomic-embed-text', prompt: text }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.embedding || null
  } catch {
    return null
  }
}

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' })

  const { conversation_id } = req.body
  if (!conversation_id) return res.status(400).json({ error: 'conversation_id required' })

  try {
    const isImage = req.file.mimetype.startsWith('image/')
    const content = isImage ? null : await extractText(req.file.buffer, req.file.mimetype, req.file.originalname)

    const result = await pool.query(
      `INSERT INTO attachments (conversation_id, file_name, file_type, content)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [conversation_id, req.file.originalname, req.file.mimetype, content]
    )
    const attachmentId = result.rows[0].id

    // Try to store vector embeddings (optional — needs pgvector + nomic-embed-text)
    if (content) {
      try {
        const chunks = chunkText(content)
        for (let i = 0; i < chunks.length; i++) {
          const embedding = await getEmbedding(chunks[i])
          if (embedding) {
            await pool.query(
              `INSERT INTO document_chunks (attachment_id, conversation_id, content, embedding, chunk_index)
               VALUES ($1, $2, $3, $4::vector, $5)`,
              [attachmentId, conversation_id, chunks[i], JSON.stringify(embedding), i]
            )
          }
        }
      } catch {
        // pgvector not available — skip
      }
    }

    res.json({
      id: attachmentId,
      file_name: req.file.originalname,
      file_type: req.file.mimetype,
      has_content: !!content,
      is_image: isImage,
      image_base64: isImage ? req.file.buffer.toString('base64') : undefined,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
