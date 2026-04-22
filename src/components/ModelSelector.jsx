import { useState, useEffect, useRef } from 'react'
import { getModels } from '../services/api.js'

export default function ModelSelector({ value, onChange }) {
  const [models, setModels] = useState([])
  const [open, setOpen] = useState(false)
  const [error, setError] = useState(null)
  const ref = useRef(null)

  useEffect(() => {
    getModels()
      .then((list) => {
        setModels(list)
        if (list.length && !value) onChange(list[0].name)
      })
      .catch(() => setError('Ollama offline'))
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (error) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        {error}
      </span>
    )
  }

  const selected = models.find((m) => m.name === value)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg
          hover:bg-[#f4f4f4] dark:hover:bg-[#2a2a2a] transition-colors group"
      >
        <span className="text-sm font-semibold text-[#0d0d0d] dark:text-[#ececec] group-hover:text-[#444] dark:group-hover:text-[#ccc]">
          {selected?.name || value || 'Select model'}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-[#6b6b6b] dark:text-[#8e8ea0] transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-[#2a2a2a] rounded-xl shadow-lg
          border border-[#e5e5e5] dark:border-[#3a3a3a] py-1.5 z-50 overflow-hidden">
          {models.map((m) => (
            <button
              key={m.name}
              onClick={() => { onChange(m.name); setOpen(false) }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm
                hover:bg-[#f4f4f4] dark:hover:bg-[#333] transition-colors text-left
                ${m.name === value ? 'text-[#0d0d0d] dark:text-[#ececec] font-medium' : 'text-[#444] dark:text-[#aaa]'}`}
            >
              <span>{m.name}</span>
              {m.name === value && (
                <svg className="w-4 h-4 text-[#0d0d0d] dark:text-[#ececec]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
