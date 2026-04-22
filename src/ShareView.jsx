import { useEffect, useState } from 'react'
import { getSharedConversation } from './services/api.js'
import MarkdownRenderer from './components/MarkdownRenderer.jsx'

export default function ShareView({ token }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getSharedConversation(token)
      .then(setData)
      .catch(() => setError('This conversation link is invalid or has been removed.'))
  }, [token])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#212121]">
        <div className="text-center">
          <p className="text-[#888] text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#212121]">
        <div className="w-5 h-5 border-2 border-[#d9d9d9] border-t-[#6b6b6b] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#212121] text-[#0d0d0d] dark:text-[#ececec]">
      {/* Header */}
      <div className="border-b border-[#f0f0f0] dark:border-[#2a2a2a] px-6 py-4 flex items-center gap-3">
        <img src="/favicon-32x32.png" alt="logo" className="w-7 h-7 rounded-full" />
        <div>
          <p className="text-sm font-semibold text-[#0d0d0d] dark:text-[#ececec]">IGS Agent</p>
          <p className="text-xs text-[#aaa]">Shared conversation</p>
        </div>
      </div>

      {/* Title */}
      <div className="max-w-3xl mx-auto px-6 pt-10 pb-4">
        <h1 className="text-2xl font-semibold text-[#0d0d0d] dark:text-[#ececec]">{data.title}</h1>
        <p className="text-sm text-[#aaa] mt-1">
          {new Date(data.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Messages */}
      <div className="max-w-3xl mx-auto">
        {data.messages.map((msg) => (
          <div key={msg.id} className="px-6 py-6 border-b border-[#f0f0f0] dark:border-[#2a2a2a] last:border-b-0">
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                {msg.role === 'user' ? (
                  <div className="w-8 h-8 rounded-full bg-[#19c37d] flex items-center justify-center text-white text-sm font-semibold">T</div>
                ) : (
                  <img src="/favicon-32x32.png" alt="AI" className="w-8 h-8 rounded-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#0d0d0d] dark:text-[#ececec] mb-2">
                  {msg.role === 'user' ? 'You' : 'IGS Agent'}
                </p>
                <div className="text-[16px] leading-[1.8] text-[#1a1a1a] dark:text-[#d1d1d1]">
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <MarkdownRenderer content={msg.content} />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-[#f0f0f0] dark:border-[#2a2a2a] mt-8 py-6 text-center">
        <p className="text-sm text-[#aaa]">Shared via <span className="font-medium text-[#555] dark:text-[#888]">IGS Agent</span></p>
      </div>
    </div>
  )
}
