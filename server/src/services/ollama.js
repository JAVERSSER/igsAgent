import dotenv from 'dotenv'

dotenv.config()

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'

export async function getModels() {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`)
  if (!res.ok) throw new Error('Failed to fetch models from Ollama')
  return res.json()
}

export async function streamChat(model, messages, onChunk, signal) {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: true }),
    signal,
  })

  if (!res.ok) throw new Error(`Ollama error: ${res.statusText}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let fullContent = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const text = decoder.decode(value, { stream: true })
    const lines = text.split('\n').filter(Boolean)

    for (const line of lines) {
      try {
        const json = JSON.parse(line)
        if (json.message?.content) {
          fullContent += json.message.content
          onChunk(json.message.content, false)
        }
        if (json.done) {
          onChunk('', true)
          return fullContent
        }
      } catch {
        // partial line, skip
      }
    }
  }

  return fullContent
}
