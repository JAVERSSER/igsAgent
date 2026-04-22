import { useState, useRef, useEffect } from 'react'
import { shareConversation } from '../services/api.js'

export default function ExportMenu({ messages, conversationId, conversationTitle }) {
  const [open, setOpen] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const exportTxt = () => {
    const lines = messages.map((m) =>
      `[${m.role === 'user' ? 'You' : 'IGS Agent'}]\n${m.content}\n`
    ).join('\n---\n\n')
    const blob = new Blob([`${conversationTitle}\n${'='.repeat(conversationTitle.length)}\n\n${lines}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${conversationTitle.slice(0, 40).replace(/[^a-z0-9]/gi, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  const exportPdf = () => {
    const win = window.open('', '_blank')
    const html = `<!DOCTYPE html><html><head>
      <meta charset="utf-8">
      <title>${conversationTitle}</title>
      <style>
        body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 24px; color: #111; line-height: 1.7; }
        h1 { font-size: 20px; font-weight: 600; margin-bottom: 32px; border-bottom: 1px solid #e5e5e5; padding-bottom: 12px; }
        .msg { margin-bottom: 28px; }
        .role { font-size: 13px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 6px; }
        .role.user { color: #19c37d; }
        .content { font-size: 15px; white-space: pre-wrap; }
        hr { border: none; border-top: 1px solid #f0f0f0; margin: 20px 0; }
      </style>
    </head><body>
      <h1>${conversationTitle}</h1>
      ${messages.map((m, i) => `
        ${i > 0 ? '<hr>' : ''}
        <div class="msg">
          <div class="role ${m.role}">${m.role === 'user' ? 'You' : 'IGS Agent'}</div>
          <div class="content">${m.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        </div>
      `).join('')}
    </body></html>`
    win.document.write(html)
    win.document.close()
    win.print()
    setOpen(false)
  }

  const handleShare = async () => {
    if (!conversationId) return
    setSharing(true)
    try {
      const { token } = await shareConversation(conversationId)
      const url = `${window.location.origin}/share/${token}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      alert('Failed to generate share link')
    } finally {
      setSharing(false)
      setOpen(false)
    }
  }

  if (!messages?.length) return null

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Export / Share"
        className="p-2 rounded-lg hover:bg-[#f4f4f4] dark:hover:bg-[#2a2a2a] text-[#6b6b6b] dark:text-[#8e8ea0] hover:text-[#0d0d0d] dark:hover:text-[#ececec] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-[#2a2a2a] rounded-xl shadow-lg border border-[#e5e5e5] dark:border-[#3a3a3a] py-1.5 z-50">
          <button
            onClick={exportPdf}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#333] dark:text-[#ccc] hover:bg-[#f4f4f4] dark:hover:bg-[#333] transition-colors text-left"
          >
            <svg className="w-4 h-4 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Export as PDF
          </button>

          <button
            onClick={exportTxt}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#333] dark:text-[#ccc] hover:bg-[#f4f4f4] dark:hover:bg-[#333] transition-colors text-left"
          >
            <svg className="w-4 h-4 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export as TXT
          </button>

          <div className="border-t border-[#f0f0f0] dark:border-[#333] my-1" />

          <button
            onClick={handleShare}
            disabled={sharing}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#333] dark:text-[#ccc] hover:bg-[#f4f4f4] dark:hover:bg-[#333] transition-colors text-left disabled:opacity-50"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-[#19c37d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[#19c37d]">Link copied!</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
                {sharing ? 'Generating...' : 'Copy share link'}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
