# Build Prompt: Local AI Chat Agent
### Stack: React + Tailwind CSS + Express.js + PostgreSQL + Ollama

---

## Architecture

```
Frontend (React + Tailwind)  →  Backend (Express.js)  →  Ollama (Local LLM)
       Port 5173                    Port 3001               Port 11434
                                       ↕
                                  PostgreSQL
                                   Port 5432
```

---

## What to Install

1. **Node.js** v18+ — runtime for both frontend and backend
2. **PostgreSQL** — stores conversations and messages
3. **Ollama** — local LLM engine that runs AI models on your machine
4. **A model** — run `ollama pull llama3` (or mistral, gemma2, qwen2.5)

---

## Database Schema (3 tables)

**conversations** — id (UUID), title, model, system_prompt, created_at, updated_at

**messages** — id (UUID), conversation_id (FK), role (user/assistant/system), content, model, tokens_used, created_at

**settings** — key, value (JSONB), updated_at

---

## Backend (Express.js) — 4 API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/chat` | POST | Send message → stream response from Ollama back to frontend via SSE |
| `/api/conversations` | GET, POST, DELETE, PATCH | List, create, delete, rename conversations |
| `/api/conversations/:id` | GET | Get single conversation with all its messages |
| `/api/models` | GET | Fetch available models from Ollama (`/api/tags`) |

### Key concept — the `/api/chat` streaming flow:
1. Receive user message from frontend
2. Save user message to PostgreSQL
3. Load full conversation history from database
4. Send history + new message to Ollama API (`POST /api/chat` with `stream: true`)
5. Read Ollama's streaming response chunk by chunk
6. Forward each chunk to frontend via Server-Sent Events (SSE)
7. When done, save full assistant response to database
8. Auto-generate conversation title from the first message

### Key packages:
`express`, `cors`, `pg` (PostgreSQL client), `dotenv`

---

## Frontend (React + Tailwind CSS) — Component Structure

```
App.jsx
├── Sidebar.jsx              — conversation list + "New Chat" button
├── ChatWindow.jsx           — scrollable message list
│   └── MessageBubble.jsx    — single message (user or assistant)
├── InputBar.jsx             — text input + send/stop button
├── ModelSelector.jsx        — dropdown to pick which model to use
└── MarkdownRenderer.jsx     — render code blocks, bold, lists in responses
```

### Key concept — streaming on the frontend:
1. User types message and clicks send
2. Frontend calls `POST /api/chat` with `fetch()`
3. Read the response as a stream using `response.body.getReader()`
4. Parse each SSE chunk (`data: {"token": "Hello", "done": false}`)
5. Append each token to the assistant message in React state (real-time typing effect)
6. When `done: true`, mark streaming complete

### Custom hooks to build:
- `useChat()` — manages messages array, streaming state, send/stop functions
- `useConversations()` — manages conversation list, active conversation, CRUD

### Key packages:
`react`, `tailwindcss`, `react-markdown` (optional), `highlight.js` (optional)

---

## Folder Structure

```
local-ai-agent/
├── server/
│   ├── package.json
│   ├── .env                    (PORT, DATABASE_URL, OLLAMA_BASE_URL)
│   └── src/
│       ├── index.js            (Express entry, middleware, start server)
│       ├── db/
│       │   ├── connection.js   (pg Pool)
│       │   └── migrations.js   (CREATE TABLE statements)
│       ├── routes/
│       │   ├── chat.js         (streaming SSE endpoint)
│       │   ├── conversations.js
│       │   └── models.js
│       └── services/
│           └── ollama.js       (helper to call Ollama API)
│
├── client/
│   ├── package.json
│   ├── vite.config.js          (proxy /api → localhost:3001)
│   └── src/
│       ├── App.jsx
│       ├── index.css           (@import "tailwindcss")
│       ├── components/         (Sidebar, ChatWindow, MessageBubble, InputBar, ModelSelector)
│       ├── hooks/              (useChat, useConversations)
│       └── services/
│           └── api.js          (fetch wrappers + streamChat function)
│
└── README.md
```

---

## UI Layout (ChatGPT-like)

```
┌────────────┬─────────────────────────────────────┐
│            │         Model: [llama3 ▾]           │
│  Sidebar   ├─────────────────────────────────────┤
│            │                                     │
│  Chat 1    │   User: How does React work?        │
│  Chat 2  ← │                                     │
│  Chat 3    │   Assistant: React is a JavaScript  │
│            │   library for building UIs...        │
│            │                                     │
│ [+ New]    ├─────────────────────────────────────┤
│ [Settings] │  [Type your message...] [Send]      │
└────────────┴─────────────────────────────────────┘
```

---

## How Ollama API Works

### List models
```
GET http://localhost:11434/api/tags
→ Returns: { "models": [{ "name": "llama3", ... }] }
```

### Chat completion (streaming)
```
POST http://localhost:11434/api/chat
Body: {
  "model": "llama3",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Hello!" }
  ],
  "stream": true
}
→ Returns line-by-line JSON:
  {"message":{"role":"assistant","content":"Hi"},"done":false}
  {"message":{"role":"assistant","content":"!"},"done":false}
  {"done":true,"total_duration":1234567}
```

---

## Build Order (step by step)

### Phase 1 — Backend foundation
1. Set up Express server with CORS and JSON middleware
2. Create PostgreSQL connection pool
3. Run migrations (create tables)
4. Build `/api/models` route (simple GET, test Ollama connection)
5. Build `/api/conversations` CRUD routes
6. Build `/api/chat` streaming route (SSE + Ollama streaming)
7. Test all routes with Postman or curl

### Phase 2 — Frontend foundation
1. Create Vite + React project, install Tailwind
2. Configure Vite proxy to forward `/api` to backend
3. Build `api.js` service with fetch wrappers and `streamChat` function
4. Build `useChat` hook (messages state, streaming, send/stop)
5. Build `useConversations` hook (list, create, delete, select)

### Phase 3 — UI components
1. Build `Sidebar` — conversation list, new chat button, delete button
2. Build `ChatWindow` — scrollable container, auto-scroll to bottom
3. Build `MessageBubble` — different styles for user vs assistant, markdown rendering
4. Build `InputBar` — textarea (auto-grow), send button, stop button while streaming
5. Build `ModelSelector` — dropdown fetching from `/api/models`
6. Wire everything together in `App.jsx`

### Phase 4 — Polish
1. Loading states and error handling
2. Markdown/code rendering in assistant messages
3. Responsive design (mobile sidebar toggle)
4. Dark/light theme with Tailwind
5. Keyboard shortcuts (Enter to send, Shift+Enter for newline)

---

## Optional Features to Add Later

- **RAG** — add ChromaDB or Qdrant, let the agent search your own documents
- **File upload** — let users upload PDFs/docs for the agent to read
- **Voice** — add Whisper (speech-to-text) and TTS
- **Tool use** — let the agent run code, search the web, query APIs
- **Authentication** — add login for multi-user support
- **Docker** — containerize everything with docker-compose