import { useState, useRef, useEffect } from 'react'
import MarkdownRenderer from './MarkdownRenderer.jsx'

export default function MessageBubble({ message, streaming, onEdit }) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(message.content)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.selectionStart = textareaRef.current.value.length
    }
  }, [editing])

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = ta.scrollHeight + 'px'
  }, [editText, editing])

  const copy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const submitEdit = () => {
    if (!editText.trim() || editText.trim() === message.content.trim()) {
      setEditing(false)
      return
    }
    setEditing(false)
    onEdit?.(message.id, editText.trim())
  }

  return (
    <div className="group px-4 sm:px-6 py-6 border-b border-[#f0f0f0] dark:border-[#2a2a2a] last:border-b-0">
      <div className="max-w-3xl mx-auto flex gap-4 sm:gap-5">

        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            <div className="w-9 h-9 rounded-full bg-[#19c37d] flex items-center justify-center text-white text-sm font-semibold">
              T
            </div>
          ) : (
            <img src="/favicon-32x32.png" alt="AI" className="w-9 h-9 rounded-full object-cover" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">

          <p className="text-[15px] font-semibold text-[#0d0d0d] dark:text-[#ececec] mb-2">
            {isUser ? 'You' : 'IGS Agent'}
          </p>

          {/* Message body */}
          {isUser && editing ? (
            <div className="flex flex-col gap-2">
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitEdit() }
                  if (e.key === 'Escape') { setEditing(false); setEditText(message.content) }
                }}
                rows={1}
                className="w-full bg-white dark:bg-[#2a2a2a] text-[17px] leading-[1.8] text-[#1a1a1a] dark:text-[#d1d1d1]
                  border border-[#d9d9d9] dark:border-[#444] rounded-xl px-4 py-3
                  resize-none outline-none focus:border-[#b4b4b4] dark:focus:border-[#666] transition-colors"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={submitEdit}
                  className="px-4 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-[#333] dark:hover:bg-[#e0e0e0] transition-colors"
                >
                  Send
                </button>
                <button
                  onClick={() => { setEditing(false); setEditText(message.content) }}
                  className="px-4 py-1.5 rounded-lg text-sm text-[#666] dark:text-[#aaa] hover:bg-[#f4f4f4] dark:hover:bg-[#2a2a2a] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className={`text-[17px] leading-[1.8] text-[#1a1a1a] dark:text-[#d1d1d1] ${!isUser && streaming ? 'typing-cursor' : ''}`}>
              {isUser ? (
                <p className="whitespace-pre-wrap leading-[1.8]">{message.content}</p>
              ) : (
                message.content
                  ? <MarkdownRenderer content={message.content} />
                  : <span className="inline-block w-2 h-5 bg-[#b4b4b4] dark:bg-[#555] rounded animate-pulse" />
              )}
            </div>
          )}

          {/* Action buttons for user messages */}
          {isUser && !editing && (
            <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={copy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-[#6b6b6b] dark:text-[#8e8ea0] hover:bg-[#f4f4f4] dark:hover:bg-[#2a2a2a] hover:text-[#0d0d0d] dark:hover:text-[#ececec] transition-colors"
                title="Copy"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-[#19c37d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-[#19c37d]">Copied</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>

              {onEdit && (
                <button
                  onClick={() => { setEditText(message.content); setEditing(true) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-[#6b6b6b] dark:text-[#8e8ea0] hover:bg-[#f4f4f4] dark:hover:bg-[#2a2a2a] hover:text-[#0d0d0d] dark:hover:text-[#ececec] transition-colors"
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit
                </button>
              )}
            </div>
          )}

          {/* Action buttons for AI messages */}
          {!isUser && !streaming && message.content && (
            <div className="flex items-center gap-1 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={copy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-[#6b6b6b] dark:text-[#8e8ea0] hover:bg-[#f4f4f4] dark:hover:bg-[#2a2a2a] hover:text-[#0d0d0d] dark:hover:text-[#ececec] transition-colors"
                title="Copy"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-[#19c37d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-[#19c37d]">Copied</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>

              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-[#6b6b6b] dark:text-[#8e8ea0] hover:bg-[#f4f4f4] dark:hover:bg-[#2a2a2a] hover:text-[#0d0d0d] dark:hover:text-[#ececec] transition-colors" title="Good response">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </button>

              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-[#6b6b6b] dark:text-[#8e8ea0] hover:bg-[#f4f4f4] dark:hover:bg-[#2a2a2a] hover:text-[#0d0d0d] dark:hover:text-[#ececec] transition-colors" title="Bad response">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905a3.61 3.61 0 01.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
