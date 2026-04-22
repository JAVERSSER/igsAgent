import { useState, useCallback, useEffect, useRef } from 'react'
import Sidebar from './components/Sidebar.jsx'
import ChatWindow from './components/ChatWindow.jsx'
import InputBar from './components/InputBar.jsx'
import ModelSelector from './components/ModelSelector.jsx'
import { useConversations } from './hooks/useConversations.js'
import { useChat } from './hooks/useChat.js'
import { getConversations } from './services/api.js'

export default function App() {
  const [model, setModel] = useState('llama3')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setSidebarOpen(false)
      else setSidebarOpen(true)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const {
    conversations, activeId, setActiveId,
    loading: convsLoading, create, remove, rename, updateTitle,
  } = useConversations()

  const handleTitleUpdate = useCallback(async (id) => {
    const data = await getConversations()
    const found = data.find((c) => c.id === id)
    if (found) updateTitle(id, found.title)
  }, [updateTitle])

  const { messages, streaming, loading: chatLoading, send, stop, editAndResend } = useChat(
    activeId, model, handleTitleUpdate
  )

  const hasMessages = messages.length > 0
  const pendingMessageRef = useRef(null)

  useEffect(() => {
    if (activeId && pendingMessageRef.current) {
      const text = pendingMessageRef.current
      pendingMessageRef.current = null
      send(text)
    }
  }, [activeId])

  const handleNewChat = async () => {
    const conv = await create(model)
    setActiveId(conv.id)
    if (isMobile) setSidebarOpen(false)
  }

  const handleSelect = (id) => {
    setActiveId(id)
    if (isMobile) setSidebarOpen(false)
  }

  const handleSend = async (text) => {
    if (!activeId) {
      pendingMessageRef.current = text
      const conv = await create(model)
      setActiveId(conv.id)
    } else {
      send(text)
    }
  }

  return (
    <div className="flex h-screen bg-white dark:bg-[#212121] text-[#0d0d0d] dark:text-[#ececec] overflow-hidden relative">

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-20" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-30 h-full' : 'relative h-full'}
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        transition-transform duration-200 ease-in-out flex-shrink-0
      `}>
        {sidebarOpen && (
          <Sidebar
            conversations={conversations}
            activeId={activeId}
            onSelect={handleSelect}
            onCreate={handleNewChat}
            onDelete={remove}
            onRename={rename}
            loading={convsLoading}
            collapsed={!isMobile && sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(v => !v)}
          />
        )}
      </div>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between px-3 sm:px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="p-2 rounded-lg hover:bg-[#f4f4f4] dark:hover:bg-[#2a2a2a] text-[#6b6b6b] dark:text-[#8e8ea0] hover:text-[#0d0d0d] dark:hover:text-[#ececec] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <ModelSelector value={model} onChange={setModel} />
          </div>

          <div className="flex items-center gap-1">
            {/* Dark/Light toggle */}
            <button
              onClick={() => setDark(v => !v)}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg hover:bg-[#f4f4f4] dark:hover:bg-[#2a2a2a] text-[#6b6b6b] dark:text-[#8e8ea0] hover:text-[#0d0d0d] dark:hover:text-[#ececec] transition-colors"
            >
              {dark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {isMobile && (
              <button onClick={handleNewChat} className="p-2 rounded-lg hover:bg-[#f4f4f4] dark:hover:bg-[#2a2a2a] text-[#6b6b6b] dark:text-[#8e8ea0] transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>
        </header>

        {/* Body */}
        {hasMessages || chatLoading ? (
          <>
            <ChatWindow messages={messages} streaming={streaming} loading={chatLoading} onEditMessage={editAndResend} />
            <InputBar onSend={handleSend} onStop={stop} streaming={streaming} model={model} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pb-10">
            <h2 className="text-xl sm:text-3xl font-semibold text-[#0d0d0d] dark:text-[#ececec] mb-6 sm:mb-8 text-center">
              How can I help you today?
            </h2>
            <div className="w-full max-w-2xl">
              <InputBar onSend={handleSend} onStop={stop} streaming={streaming} model={model} centered />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
