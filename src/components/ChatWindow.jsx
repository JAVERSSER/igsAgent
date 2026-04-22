import { useEffect, useRef, useState, useCallback } from 'react'
import MessageBubble from './MessageBubble.jsx'

export default function ChatWindow({ messages, streaming, loading, onEditMessage }) {
  const bottomRef = useRef(null)
  const containerRef = useRef(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const scrollToBottom = useCallback((smooth = false) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  useEffect(() => {
    scrollToBottom(false)
  }, [messages, scrollToBottom])

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    setShowScrollBtn(distanceFromBottom > 200)
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#d9d9d9] dark:border-[#444] border-t-[#6b6b6b] dark:border-t-[#999] rounded-full animate-spin" />
      </div>
    )
  }

  if (!messages.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <h2 className="text-[28px] sm:text-[32px] font-semibold text-[#0d0d0d] dark:text-[#ececec] mb-8 leading-snug">
          How can I help you today?
        </h2>
      </div>
    )
  }

  const lastMsg = messages[messages.length - 1]

  return (
    <div className="flex-1 relative overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto"
      >
        <div className="max-w-3xl mx-auto">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              streaming={streaming && msg.id === lastMsg?.id && msg.role === 'assistant'}
              onEdit={onEditMessage}
            />
          ))}
          <div ref={bottomRef} className="h-6" />
        </div>
      </div>

      {showScrollBtn && (
        <button
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-4 left-1/2 -translate-x-1/2
            w-8 h-8 rounded-full bg-white dark:bg-[#2a2a2a] border border-[#d9d9d9] dark:border-[#3a3a3a] shadow-md
            flex items-center justify-center hover:bg-[#f4f4f4] dark:hover:bg-[#333] transition-all"
        >
          <svg className="w-4 h-4 text-[#444] dark:text-[#aaa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
    </div>
  )
}
