import { useState, useCallback, useRef, useEffect } from 'react'
import { getConversation, streamChat, deleteMessagesFrom } from '../services/api.js'

export function useChat(conversationId, model, onTitleUpdate) {
  const [messages, setMessages] = useState([])
  const [streaming, setStreaming] = useState(false)
  const [loading, setLoading] = useState(false)
  const abortRef = useRef(null)
  const skipLoadRef = useRef(false)
  const tokenBufferRef = useRef('')
  const rafRef = useRef(null)
  // Keeps live stream data while user is on a different conversation
  // Shape: { convId, assistantMsgId, content } — null when no background stream
  const pendingConvRef = useRef(null)

  useEffect(() => {
    setStreaming(false)

    if (!conversationId) {
      setMessages([])
      return
    }

    // Returning to the conversation whose stream is still running in background
    if (pendingConvRef.current?.convId === conversationId) {
      const pending = pendingConvRef.current
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
      setLoading(true)
      getConversation(conversationId)
        .then((data) => {
          // Cancel any rAF that fired during the DB round-trip to avoid double-counting
          if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
          tokenBufferRef.current = ''
          if (pendingConvRef.current) {
            // Stream still in progress: overlay live assistant message
            setMessages([
              ...(data.messages || []),
              { id: pending.assistantMsgId, role: 'assistant', content: pending.content, created_at: new Date().toISOString() },
            ])
            setStreaming(true)
          } else {
            // Stream finished while we were loading from DB — DB has the complete response
            setMessages(data.messages || [])
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false))
      return
    }

    if (skipLoadRef.current) {
      skipLoadRef.current = false
      return
    }

    setLoading(true)
    getConversation(conversationId)
      .then((data) => setMessages(data.messages || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [conversationId])

  const skipNextLoad = useCallback(() => {
    skipLoadRef.current = true
  }, [])

  const send = useCallback(
    async (content, attachmentIds = []) => {
      if (!conversationId || (!content.trim() && !attachmentIds.length)) return

      const userMsg = {
        id: crypto.randomUUID(),
        role: 'user',
        content: content || '',
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
      tokenBufferRef.current = ''
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
      pendingConvRef.current = { convId: conversationId, assistantMsgId: assistantMsg.id, content: '' }

      try {
        await streamChat({
          conversationId,
          content: content || '',
          model,
          attachmentIds,
          signal: controller.signal,
          onToken: (token) => {
            tokenBufferRef.current += token
            // Also accumulate in pendingConvRef so background navigation can restore it
            if (pendingConvRef.current) pendingConvRef.current.content += token
            if (!rafRef.current) {
              rafRef.current = requestAnimationFrame(() => {
                const buffered = tokenBufferRef.current
                tokenBufferRef.current = ''
                rafRef.current = null
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsg.id ? { ...m, content: m.content + buffered } : m
                  )
                )
              })
            }
          },
          onDone: () => {
            if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
            const remaining = tokenBufferRef.current
            tokenBufferRef.current = ''
            if (remaining) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id ? { ...m, content: m.content + remaining } : m
                )
              )
            }
            pendingConvRef.current = null
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
    [conversationId, model, onTitleUpdate]
  )

  const stop = useCallback(() => {
    abortRef.current?.abort()
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    tokenBufferRef.current = ''
    pendingConvRef.current = null
    setStreaming(false)
  }, [])

  const editAndResend = useCallback(async (messageId, newContent) => {
    if (!conversationId || !newContent.trim()) return
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === messageId)
      return idx === -1 ? prev : prev.slice(0, idx)
    })
    try {
      await deleteMessagesFrom(conversationId, messageId)
    } catch (err) {
      console.error('Failed to clear messages from DB', err)
    }
    await send(newContent)
  }, [conversationId, send])

  return { messages, streaming, loading, send, stop, editAndResend, skipNextLoad }
}
