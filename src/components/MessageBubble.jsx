import { useState } from 'react'
import MarkdownRenderer from './MarkdownRenderer.jsx'

export default function MessageBubble({ message, streaming }) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`group flex gap-4 px-4 py-6 ${isUser ? '' : ''}`}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full flex-shrink-0 mt-0.5 overflow-hidden">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-[#19c37d] flex items-center justify-center text-white text-sm font-semibold">
            T
          </div>
        ) : (
          <img src="/favicon-32x32.png" alt="AI" className="w-8 h-8 rounded-full object-cover" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0d0d0d] mb-1">
          {isUser ? 'You' : 'IGS Agent'}
        </p>
        <div className={`text-sm text-[#0d0d0d] leading-7 ${!isUser && streaming ? 'typing-cursor' : ''}`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            message.content
              ? <MarkdownRenderer content={message.content} />
              : <span className="inline-block w-2 h-4 bg-[#b4b4b4] rounded animate-pulse" />
          )}
        </div>

        {/* Action buttons for AI messages */}
        {!isUser && !streaming && message.content && (
          <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={copy} className="p-1.5 rounded-lg hover:bg-[#f4f4f4] text-[#6b6b6b] transition-colors" title="Copy">
              {copied ? (
                <svg className="w-4 h-4 text-[#19c37d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            <button className="p-1.5 rounded-lg hover:bg-[#f4f4f4] text-[#6b6b6b] transition-colors" title="Good response">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </button>
            <button className="p-1.5 rounded-lg hover:bg-[#f4f4f4] text-[#6b6b6b] transition-colors" title="Bad response">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905a3.61 3.61 0 01.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
