export async function getModels() {
  const res = await fetch('/api/models')
  if (!res.ok) throw new Error('Failed to fetch models')
  const data = await res.json()
  return data.models || []
}

export async function getConversations() {
  const res = await fetch('/api/conversations')
  if (!res.ok) throw new Error('Failed to fetch conversations')
  return res.json()
}

export async function createConversation(model = 'llama3') {
  const res = await fetch('/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model }),
  })
  if (!res.ok) throw new Error('Failed to create conversation')
  return res.json()
}

export async function getConversation(id) {
  const res = await fetch(`/api/conversations/${id}`)
  if (!res.ok) throw new Error('Failed to fetch conversation')
  return res.json()
}

export async function deleteConversation(id) {
  const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete conversation')
}

export async function renameConversation(id, title) {
  const res = await fetch(`/api/conversations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  if (!res.ok) throw new Error('Failed to rename conversation')
  return res.json()
}

export async function improveText({ text, model, onToken, onDone, signal }) {
  const res = await fetch('/api/improve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model }),
    signal,
  })
  if (!res.ok) throw new Error('Improve request failed')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const json = JSON.parse(line.slice(6))
        if (json.error) throw new Error(json.error)
        if (json.token) onToken(json.token)
        if (json.done) { onDone(); return }
      } catch (e) {
        if (e.message !== 'Unexpected end of JSON input') throw e
      }
    }
  }
  onDone()
}

export async function streamChat({ conversationId, content, model, onToken, onDone, signal }) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversation_id: conversationId, content, model }),
    signal,
  })

  if (!res.ok) throw new Error('Chat request failed')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const json = JSON.parse(line.slice(6))
        if (json.error) throw new Error(json.error)
        if (json.token) onToken(json.token)
        if (json.done) {
          onDone()
          return
        }
      } catch (e) {
        if (e.message !== 'Unexpected end of JSON input') throw e
      }
    }
  }
  onDone()
}
