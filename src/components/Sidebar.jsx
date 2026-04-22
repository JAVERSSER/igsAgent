import { useState, useRef, useEffect } from 'react'

export default function Sidebar({ conversations, activeId, onSelect, onCreate, onDelete, onRename, loading }) {
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')
  const searchRef = useRef(null)

  useEffect(() => {
    if (searching) searchRef.current?.focus()
  }, [searching])

  const startEdit = (e, conv) => {
    e.stopPropagation()
    setEditingId(conv.id)
    setEditTitle(conv.title)
  }

  const submitEdit = (id) => {
    if (editTitle.trim()) onRename(id, editTitle.trim())
    setEditingId(null)
  }

  const closeSearch = () => {
    setSearching(false)
    setQuery('')
  }

  const filtered = query.trim()
    ? conversations.filter((c) =>
        c.title.toLowerCase().includes(query.toLowerCase())
      )
    : conversations

  return (
    <div className="w-64 h-full flex flex-col bg-[#f9f9f9] flex-shrink-0 border-r border-[#e5e5e5]">

      {/* Logo */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#ececec] transition-colors"
          title="New chat"
        >
          <img
            src="/favicon-32x32.png"
            alt="IGS Agent"
            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
          />
          <span className="font-semibold text-[15px] text-gray-900">IGS Agent</span>
        </button>
      </div>

      {/* New Chat */}
      <div className="px-3 py-1">
        <button
          onClick={onCreate}
          disabled={loading}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
            hover:bg-[#ececec] text-[#0d0d0d] text-sm transition-colors text-left
            disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New chat
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-1">
        {searching ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#d9d9d9] focus-within:border-[#b4b4b4] transition-colors">
            <svg className="w-4 h-4 text-[#6b6b6b] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
              placeholder="Search chats..."
              className="flex-1 bg-transparent text-sm text-[#0d0d0d] placeholder-[#b4b4b4] outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-[#b4b4b4] hover:text-[#6b6b6b] flex-shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button onClick={closeSearch} className="text-[#b4b4b4] hover:text-[#6b6b6b] flex-shrink-0 text-xs">
              Esc
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearching(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
              hover:bg-[#ececec] text-[#0d0d0d] text-sm transition-colors text-left"
          >
            <svg className="w-4 h-4 text-[#6b6b6b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search chats
          </button>
        )}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {/* Search result label */}
        {searching && query && (
          <p className="text-xs text-[#6b6b6b] px-3 mb-1">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{query}"
          </p>
        )}

        {!searching && conversations.length > 0 && (
          <p className="text-xs font-semibold text-[#6b6b6b] px-3 mb-1">Recents</p>
        )}

        <div className="space-y-0.5">
          {filtered.map((conv) => (
            <div
              key={conv.id}
              onClick={() => { onSelect(conv.id); if (searching) closeSearch() }}
              className={`group flex items-center rounded-lg px-3 py-2 cursor-pointer text-sm transition-colors
                ${activeId === conv.id
                  ? 'bg-[#ececec] text-[#0d0d0d]'
                  : 'text-[#0d0d0d] hover:bg-[#ececec]'
                }`}
            >
              {editingId === conv.id ? (
                <input
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => submitEdit(conv.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitEdit(conv.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-white text-[#0d0d0d] text-sm px-1.5 py-0.5 rounded border border-[#d9d9d9] outline-none"
                />
              ) : (
                <span className="flex-1 truncate">
                  {/* Highlight matching text */}
                  {query ? highlightMatch(conv.title, query) : conv.title}
                </span>
              )}

              <div className="hidden group-hover:flex items-center gap-1 ml-1 flex-shrink-0">
                <button
                  onClick={(e) => startEdit(e, conv)}
                  className="p-1 rounded hover:bg-[#d9d9d9] text-[#6b6b6b]"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(conv.id) }}
                  className="p-1 rounded hover:bg-[#d9d9d9] text-[#6b6b6b] hover:text-red-500"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center mt-6 px-4">
              {query ? (
                <>
                  <p className="text-sm text-[#6b6b6b]">No results found</p>
                  <p className="text-xs text-[#b4b4b4] mt-1">Try a different search term</p>
                </>
              ) : (
                <p className="text-xs text-[#b4b4b4]">No conversations yet</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User profile */}
      <div className="px-3 py-3 border-t border-[#e5e5e5]">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#ececec] cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-[#19c37d] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            T
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#0d0d0d] truncate">Thirith Heng</p>
            <p className="text-xs text-[#6b6b6b]">Free</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function highlightMatch(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-[#0d0d0d] rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}
