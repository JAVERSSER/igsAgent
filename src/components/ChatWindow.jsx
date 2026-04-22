import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble.jsx'

export default function ChatWindow({ messages, streaming, loading }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#d9d9d9] border-t-[#6b6b6b] rounded-full animate-spin" />
      </div>
    )
  }

  if (!messages.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <h2 className="text-3xl font-semibold text-[#0d0d0d] mb-8">
          How can I help you today?
        </h2>
      </div>
    )
  }

  const lastMsg = messages[messages.length - 1]

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            streaming={streaming && msg.id === lastMsg?.id && msg.role === 'assistant'}
          />
        ))}
        <div ref={bottomRef} className="h-6" />
      </div>
    </div>
  )
}
