import { useState, useEffect, useCallback } from 'react'
import {
  getConversations,
  createConversation,
  deleteConversation,
  renameConversation,
} from '../services/api.js'

export function useConversations() {
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const data = await getConversations()
      setConversations(data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(async (model) => {
    // Reuse existing empty chat instead of creating duplicate
    const existing = conversations.find((c) => c.title === 'New Chat')
    if (existing) {
      setActiveId(existing.id)
      // Move it to top
      setConversations((prev) => [
        existing,
        ...prev.filter((c) => c.id !== existing.id),
      ])
      return existing
    }

    setLoading(true)
    try {
      const conv = await createConversation(model)
      // Add new chat to top
      setConversations((prev) => [conv, ...prev])
      setActiveId(conv.id)
      return conv
    } finally {
      setLoading(false)
    }
  }, [conversations])

  const remove = useCallback(async (id) => {
    await deleteConversation(id)
    setConversations((prev) => prev.filter((c) => c.id !== id))
    setActiveId((prev) => (prev === id ? null : prev))
  }, [])

  const rename = useCallback(async (id, title) => {
    const updated = await renameConversation(id, title)
    setConversations((prev) => prev.map((c) => (c.id === id ? updated : c)))
  }, [])

  const updateTitle = useCallback((id, title) => {
    setConversations((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, title } : c))
      // Move updated conversation to top
      const target = updated.find((c) => c.id === id)
      return [target, ...updated.filter((c) => c.id !== id)]
    })
  }, [])

  return {
    conversations,
    activeId,
    setActiveId,
    loading,
    create,
    remove,
    rename,
    refresh,
    updateTitle,
  }
}
