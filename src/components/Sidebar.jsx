import { useState, useRef, useEffect } from 'react'

function groupConversations(conversations) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today - 86400000)
  const sevenDays = new Date(today - 7 * 86400000)
  const thirtyDays = new Date(today - 30 * 86400000)

  const groups = {
    Today: [],
    Yesterday: [],
    'Previous 7 Days': [],
    'Previous 30 Days': [],
    Older: [],
  }

  conversations.forEach((c) => {
    const d = new Date(c.updated_at || c.created_at)
    if (d >= today) groups['Today'].push(c)
    else if (d >= yesterday) groups['Yesterday'].push(c)
    else if (d >= sevenDays) groups['Previous 7 Days'].push(c)
    else if (d >= thirtyDays) groups['Previous 30 Days'].push(c)
    else groups['Older'].push(c)
  })

  return Object.entries(groups).filter(([, items]) => items.length > 0)
}

export default function Sidebar({
  conversations, activeId, onSelect, onCreate,
  onDelete, onRename, loading, collapsed, onToggleCollapse,
}) {
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

  const grouped = groupConversations(filtered)

  return (
    <div
      className={`h-full flex flex-col bg-[#f9f9f9] dark:bg-[#171717] border-r border-[#ebebeb] dark:border-[#2f2f2f] flex-shrink-0
        ${collapsed ? 'w-[60px]' : 'w-[260px]'}`}
    >
      {/* ── TOP ── */}
      <div className="flex-shrink-0 px-2 pt-3 pb-1 space-y-0.5">

        {collapsed ? (
          /* Collapsed: just logo as expand trigger */
          <div className="flex justify-center py-1">
            <button
              onClick={onToggleCollapse}
              title="Expand sidebar"
              className="w-10 h-10 rounded-xl flex items-center justify-center
                hover:bg-[#f0f0f0] dark:hover:bg-[#2a2a2a] transition-all duration-200 ease-in-out"
            >
              <img src="/favicon-32x32.png" alt="logo" className="w-6 h-6 rounded-full object-cover" />
            </button>
          </div>
        ) : (
          /* Expanded: brand + collapse button */
          <div className="flex items-center justify-between px-1 mb-1">
            <button
              onClick={onCreate}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg w-full
                hover:bg-[#f0f0f0] dark:hover:bg-[#2a2a2a] transition-all duration-200 ease-in-out text-left"
            >
              <img src="/favicon-32x32.png" alt="logo" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
              <span className="text-[15px] font-medium text-[#0d0d0d] dark:text-[#ececec] tracking-tight">IGS Agent</span>
            </button>
            <button
              onClick={onToggleCollapse}
              title="Collapse"
              className="p-1.5 rounded-lg text-[#999] dark:text-[#555] hover:text-[#444] dark:hover:text-[#aaa] hover:bg-[#f0f0f0] dark:hover:bg-[#2a2a2a] transition-all duration-200 ease-in-out flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* New Chat — expanded only */}
        {!collapsed && (
          <button
            onClick={onCreate}
            disabled={loading}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[15px] text-[#333] dark:text-[#ccc]
              hover:bg-[#f0f0f0] dark:hover:bg-[#2a2a2a] transition-all duration-200 ease-in-out disabled:opacity-40 text-left"
          >
            <svg className="w-4 h-4 text-[#555] dark:text-[#888] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New chat
          </button>
        )}

        {/* Search */}
        {!collapsed && (
          searching ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-[#2a2a2a] border border-[#e0e0e0] dark:border-[#3a3a3a]
              focus-within:border-[#c0c0c0] dark:focus-within:border-[#555] transition-all duration-200 ease-in-out">
              <svg className="w-3.5 h-3.5 text-[#aaa] dark:text-[#555] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
                placeholder="Search chats..."
                className="flex-1 bg-transparent text-sm text-[#333] dark:text-[#ccc] placeholder-[#bbb] dark:placeholder-[#555] outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-[#bbb] dark:text-[#555] hover:text-[#888] dark:hover:text-[#999] transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button onClick={closeSearch} className="text-[10px] text-[#bbb] dark:text-[#555] hover:text-[#888] dark:hover:text-[#999] transition-colors font-normal">
                ESC
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearching(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[15px] text-[#888] dark:text-[#666]
                hover:bg-[#f0f0f0] dark:hover:bg-[#2a2a2a] hover:text-[#444] dark:hover:text-[#ccc] transition-all duration-200 ease-in-out text-left"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search chats
            </button>
          )
        )}
      </div>

      {/* ── MIDDLE — Chat list ── */}
      <div className="flex-1 overflow-y-auto px-2 py-1 min-h-0">
        {collapsed ? (
          <div className="flex flex-col items-center gap-1 pt-2">
            {/* New chat / compose */}
            <button
              onClick={onCreate}
              title="New chat"
              disabled={loading}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#555] dark:text-[#888]
                hover:bg-[#f0f0f0] dark:hover:bg-[#2a2a2a] transition-all duration-200 ease-in-out disabled:opacity-40"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.213l-4 1 1-4L16.862 3.487z" />
              </svg>
            </button>

            {/* Search */}
            <button
              onClick={onToggleCollapse}
              title="Search chats"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#555] dark:text-[#888]
                hover:bg-[#f0f0f0] dark:hover:bg-[#2a2a2a] transition-all duration-200 ease-in-out"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Chat history */}
            <button
              onClick={onToggleCollapse}
              title="Chat history"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#555] dark:text-[#888]
                hover:bg-[#f0f0f0] dark:hover:bg-[#2a2a2a] transition-all duration-200 ease-in-out"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>
        ) : (
          <>
            {searching && query && (
              <p className="text-[13px] text-[#aaa] dark:text-[#555] px-3 mb-2">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{query}"
              </p>
            )}

            {grouped.length === 0 && (
              <p className="text-[13px] text-[#bbb] dark:text-[#555] text-center mt-8 px-4">
                {query ? 'No results found' : 'No conversations yet'}
              </p>
            )}

            {grouped.map(([label, items]) => (
              <div key={label} className="mb-4">
                <p className="text-[12px] font-normal text-[#bbb] dark:text-[#555] uppercase tracking-wider px-3 mb-1">
                  {label}
                </p>
                <div className="space-y-0.5">
                  {items.map((conv) => (
                    <ConvItem
                      key={conv.id}
                      conv={conv}
                      active={activeId === conv.id}
                      editing={editingId === conv.id}
                      editTitle={editTitle}
                      query={query}
                      searching={searching}
                      onSelect={onSelect}
                      onDelete={onDelete}
                      onStartEdit={startEdit}
                      onSubmitEdit={submitEdit}
                      onEditChange={setEditTitle}
                      onCancelEdit={() => setEditingId(null)}
                      closeSearch={closeSearch}
                    />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── BOTTOM — User profile ── */}
      <div className="flex-shrink-0 border-t border-[#ebebeb] dark:border-[#2f2f2f] px-2 py-2">
        {collapsed ? (
          <div className="flex justify-center">
            <div
              title="Thirith Heng"
              className="w-8 h-8 rounded-full bg-[#19c37d] flex items-center justify-center
                text-white text-xs font-medium cursor-pointer"
            >
              T
            </div>
          </div>
        ) : (
          <button className="w-full flex items-center gap-3 px-2 py-2 rounded-lg
            hover:bg-[#f0f0f0] dark:hover:bg-[#2a2a2a] transition-all duration-200 ease-in-out group text-left">
            <div className="w-7 h-7 rounded-full bg-[#19c37d] flex items-center justify-center
              text-white text-xs font-medium flex-shrink-0">
              T
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] text-[#333] dark:text-[#ccc] truncate">Thirith Heng</p>
              <p className="text-[13px] text-[#aaa] dark:text-[#555]">Free plan</p>
            </div>
            <svg className="w-4 h-4 text-[#ccc] dark:text-[#444] group-hover:text-[#888] dark:group-hover:text-[#888] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

function ConvItem({
  conv, active, editing, editTitle, query, searching,
  onSelect, onDelete, onStartEdit, onSubmitEdit, onEditChange, onCancelEdit, closeSearch,
}) {
  return (
    <div
      onClick={() => { onSelect(conv.id); if (searching) closeSearch() }}
      className={`group relative flex items-center rounded-lg px-3 py-2 cursor-pointer text-[15px]
        transition-all duration-200 ease-in-out
        ${active
          ? 'bg-[#ebebeb] dark:bg-[#2f2f2f] text-[#111] dark:text-[#ececec]'
          : 'text-[#444] dark:text-[#aaa] hover:bg-[#f0f0f0] dark:hover:bg-[#2a2a2a] hover:text-[#111] dark:hover:text-[#ececec] hover:pl-3.5'
        }`}
    >
      {editing ? (
        <input
          autoFocus
          value={editTitle}
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={() => onSubmitEdit(conv.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmitEdit(conv.id)
            if (e.key === 'Escape') onCancelEdit()
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 bg-white dark:bg-[#1a1a1a] text-sm px-2 py-0.5 rounded border border-[#ddd] dark:border-[#444] outline-none text-[#333] dark:text-[#ccc]"
        />
      ) : (
        <span className="flex-1 truncate font-normal">
          {query ? highlight(conv.title, query) : conv.title}
        </span>
      )}

      {/* Hover actions */}
      <div className="absolute right-2 hidden group-hover:flex items-center gap-0.5 bg-[#f0f0f0] dark:bg-[#2a2a2a] rounded-md px-0.5">
        <button
          onClick={(e) => onStartEdit(e, conv)}
          title="Rename"
          className="p-1 rounded text-[#999] dark:text-[#666] hover:text-[#444] dark:hover:text-[#ccc] transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(conv.id) }}
          title="Delete"
          className="p-1 rounded text-[#999] dark:text-[#666] hover:text-red-400 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function highlight(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-100 dark:bg-yellow-900/40 text-[#333] dark:text-[#ddd] rounded-sm px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}
