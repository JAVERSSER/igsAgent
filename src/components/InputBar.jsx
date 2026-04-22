import { useState, useRef, useEffect } from 'react'
import { improveText, uploadFile } from '../services/api.js'

export default function InputBar({ onSend, onStop, streaming, disabled, model, centered, conversationId }) {
  const [text, setText] = useState('')
  const [improving, setImproving] = useState(false)
  const [attachments, setAttachments] = useState([]) // { id, file_name, file_type, is_image, image_base64, uploading, error }
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const improveAbortRef = useRef(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'
  }, [text])

  const handleSend = () => {
    if ((!text.trim() && !attachments.length) || streaming) return
    const readyAttachments = attachments.filter((a) => a.id && !a.uploading && !a.error)
    onSend(text, readyAttachments.map((a) => a.id))
    setText('')
    setAttachments([])
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
        text: original, model: model || 'llama3', signal: controller.signal,
        onToken: (token) => { improved += token; setText(improved) },
        onDone: () => setImproving(false),
      })
    } catch (err) {
      if (err.name !== 'AbortError') setText(original)
      setImproving(false)
    }
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    e.target.value = ''

    if (!conversationId) {
      alert('Please start a conversation first before attaching files.')
      return
    }

    for (const file of files) {
      const tempId = crypto.randomUUID()
      setAttachments((prev) => [...prev, { tempId, file_name: file.name, file_type: file.type, uploading: true }])
      try {
        const result = await uploadFile(file, conversationId)
        setAttachments((prev) =>
          prev.map((a) => a.tempId === tempId ? { ...result, tempId } : a)
        )
      } catch (err) {
        setAttachments((prev) =>
          prev.map((a) => a.tempId === tempId ? { ...a, uploading: false, error: true } : a)
        )
      }
    }
  }

  const removeAttachment = (tempId) => {
    setAttachments((prev) => prev.filter((a) => a.tempId !== tempId))
  }

  const canSend = (text.trim() || attachments.some((a) => a.id)) && !streaming && !improving

  return (
    <div className={centered ? '' : 'px-3 sm:px-6 pb-4 sm:pb-6 pt-2'}>
      <div className={centered ? 'w-full' : 'max-w-3xl mx-auto'}>

        {/* Improve button */}
        {text.trim() && !streaming && (
          <div className="flex justify-end mb-2 px-1">
            <button
              onClick={handleImprove}
              disabled={improving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                bg-[#f4f4f4] dark:bg-[#2a2a2a] hover:bg-[#e9e9e9] dark:hover:bg-[#333]
                border border-[#e5e5e5] dark:border-[#3a3a3a]
                text-xs text-[#444] dark:text-[#aaa] font-medium transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {improving ? (
                <><div className="w-3 h-3 border-2 border-[#999] border-t-transparent rounded-full animate-spin" />Improving...</>
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
        <div className="bg-white dark:bg-[#2f2f2f] rounded-3xl
          border border-[#d9d9d9] dark:border-[#444] shadow-sm hover:border-[#b4b4b4] dark:hover:border-[#666]
          focus-within:border-[#b4b4b4] dark:focus-within:border-[#666] transition-colors"
        >
          {/* Attachment previews */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pt-3">
              {attachments.map((att) => (
                <div key={att.tempId} className="relative group/att flex items-center gap-2 bg-[#f4f4f4] dark:bg-[#3a3a3a] rounded-xl px-3 py-2 max-w-[200px]">
                  {att.is_image && att.image_base64 ? (
                    <img src={`data:${att.file_type};base64,${att.image_base64}`} alt={att.file_name} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-[#e0e0e0] dark:bg-[#444] flex items-center justify-center flex-shrink-0">
                      {att.uploading ? (
                        <div className="w-4 h-4 border-2 border-[#999] border-t-transparent rounded-full animate-spin" />
                      ) : att.error ? (
                        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      ) : (
                        <svg className="w-4 h-4 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                      )}
                    </div>
                  )}
                  <span className="text-xs text-[#555] dark:text-[#aaa] truncate">{att.file_name}</span>
                  <button
                    onClick={() => removeAttachment(att.tempId)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#888] hover:bg-[#555] text-white rounded-full hidden group-hover/att:flex items-center justify-center transition-colors"
                  >
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 px-4 py-2.5 min-h-[52px]">
            {/* File attach button */}
            <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.txt,.csv,.json,.md,.png,.jpg,.jpeg,.gif,.webp" className="hidden" onChange={handleFileSelect} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || improving}
              className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-[#f4f4f4] dark:hover:bg-[#3a3a3a]
                flex items-center justify-center text-[#6b6b6b] dark:text-[#8e8ea0] transition-colors disabled:opacity-40"
              title="Attach file"
            >
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
              className="flex-1 bg-transparent text-[#0d0d0d] dark:text-[#ececec] placeholder-[#b4b4b4] dark:placeholder-[#555]
                resize-none outline-none text-[16px] leading-[1.7] self-center py-1"
            />

            <div className="flex items-center gap-1 flex-shrink-0">
              <button className="w-8 h-8 rounded-full hover:bg-[#f4f4f4] dark:hover:bg-[#3a3a3a]
                items-center justify-center text-[#6b6b6b] dark:text-[#8e8ea0] transition-colors hidden sm:flex">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>

              {streaming ? (
                <button onClick={onStop} className="w-8 h-8 rounded-full bg-black dark:bg-white hover:bg-[#333] dark:hover:bg-[#e0e0e0] flex items-center justify-center transition-colors">
                  <svg className="w-3.5 h-3.5 text-white dark:text-black" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="1" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!canSend || disabled || improving}
                  className="w-8 h-8 rounded-full bg-black dark:bg-white hover:bg-[#333] dark:hover:bg-[#e0e0e0]
                    disabled:bg-[#d9d9d9] dark:disabled:bg-[#444] disabled:cursor-not-allowed
                    flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m-7 7l7-7 7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-[#b4b4b4] dark:text-[#555] text-xs mt-3">
          IGS Agent can make mistakes. Check important info.
        </p>
      </div>
    </div>
  )
}
