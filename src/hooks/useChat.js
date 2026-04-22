import { useState, useCallback, useRef, useEffect } from 'react'
import { getConversation, streamChat } from '../services/api.js'

export function useChat(conversationId, model, onTitleUpdate) {
  const [messages, setMessages] = useState([])
  const [streaming, setStreaming] = useState(false)
  const [loading, setLoading] = useState(false)
  const abortRef = useRef(null)

  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      return
    }
    setLoading(true)
    getConversation(conversationId)
      .then((data) => setMessages(data.messages || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [conversationId])

  const send = useCallback(
    async (content) => {
      if (!conversationId || !content.trim() || streaming) return

      const userMsg = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      }
      const assistantMsg = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setStreaming(true)

      const controller = new AbortController()
      abortRef.current = controller

      try {
        await streamChat({
          conversationId,
          content,
          model,
          signal: controller.signal,
          onToken: (token) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsg.id ? { ...m, content: m.content + token } : m
              )
            )
          },
          onDone: () => {
            setStreaming(false)
            if (onTitleUpdate) onTitleUpdate(conversationId)
          },
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: 'Error: ' + err.message }
                : m
            )
          )
        }
      } finally {
        setStreaming(false)
      }
    },
    [conversationId, model, streaming, onTitleUpdate]
  )

  const stop = useCallback(() => {
    abortRef.current?.abort()
    setStreaming(false)
  }, [])

  return { messages, streaming, loading, send, stop }
}
