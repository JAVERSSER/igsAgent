import { useState, useRef, useEffect } from 'react'
import { improveText } from '../services/api.js'

export default function InputBar({ onSend, onStop, streaming, disabled, model, centered }) {
  const [text, setText] = useState('')
  const [improving, setImproving] = useState(false)
  const textareaRef = useRef(null)
  const improveAbortRef = useRef(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'
  }, [text])

  const handleSend = () => {
    if (!text.trim() || streaming) return
    onSend(text)
    setText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleImprove = async () => {
    if (!text.trim() || improving || streaming) return
    setImproving(true)
    const original = text
    setText('')

    const controller = new AbortController()
    improveAbortRef.current = controller

    try {
      let improved = ''
      await improveText({
        text: original,
        model: model || 'llama3',
        signal: controller.signal,
        onToken: (token) => {
          improved += token
          setText(improved)
        },
        onDone: () => setImproving(false),
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        setText(original)
      }
      setImproving(false)
    }
  }

  return (
    <div className={centered ? '' : 'px-3 sm:px-6 pb-4 sm:pb-6 pt-2'}>
      <div className={centered ? 'w-full' : 'max-w-3xl mx-auto'}>

        {/* Improve button — shows when text is typed */}
        {text.trim() && !streaming && (
          <div className="flex justify-end mb-2 px-1">
            <button
              onClick={handleImprove}
              disabled={improving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                bg-[#f4f4f4] hover:bg-[#e9e9e9] border border-[#e5e5e5]
                text-xs text-[#444] font-medium transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {improving ? (
                <>
                  <div className="w-3 h-3 border-2 border-[#999] border-t-transparent rounded-full animate-spin" />
                  Improving...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-[#7c3aed]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Improve Grammar
                </>
              )}
            </button>
          </div>
        )}

        {/* Input box */}
        <div className="flex items-center gap-2 bg-white rounded-3xl px-4 py-2.5
          border border-[#d9d9d9] shadow-sm hover:border-[#b4b4b4]
          focus-within:border-[#b4b4b4] transition-colors min-h-[52px]"
        >
          {/* Plus */}
          <button className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-[#f4f4f4]
            flex items-center justify-center text-[#6b6b6b] transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything"
            rows={1}
            disabled={disabled || improving}
            className="flex-1 bg-transparent text-[#0d0d0d] placeholder-[#b4b4b4]
              resize-none outline-none text-sm leading-6 self-center py-1"
          />

          <div className="flex items-center gap-1 flex-shrink-0">
            <button className="w-8 h-8 rounded-full hover:bg-[#f4f4f4]
              items-center justify-center text-[#6b6b6b] transition-colors hidden sm:flex">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>

            {streaming ? (
              <button
                onClick={onStop}
                className="w-8 h-8 rounded-full bg-black hover:bg-[#333]
                  flex items-center justify-center transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="1" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!text.trim() || disabled || improving}
                className="w-8 h-8 rounded-full bg-black hover:bg-[#333]
                  disabled:bg-[#d9d9d9] disabled:cursor-not-allowed
                  flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m-7 7l7-7 7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-[#b4b4b4] text-xs mt-3">
          IGS Agent can make mistakes. Check important info.
        </p>
      </div>
    </div>
  )
}
