

🤖 AI Agent Summary

An AI agent is made of 2 parts:

1. 🧠 Existing tools (ready-made)

You don’t build these, you just use them:

OpenAI ChatGPT API (powerful AI brain)
Ollama (run AI locally, free)
ChatGPT (ready UI in browser)
2. 🛠 Custom tools (you build)

These are your own features:

PDF / Excel export
Web scraping / search
Send messages (Telegram, WhatsApp)
Custom business logic
⚙️ How AI agent works
User → AI Brain → Decide tool → Run tool → Result
💡 Key idea

👉 AI model alone is not an agent
👉 AI agent = AI + tools + decision system

------------------------------------
This project using posgesql or not?
------------------------------------
Yes, this project uses PostgreSQL to store:

Table	What it stores
conversations	Each chat session (title, model, date)
messages	Every message sent and received
settings	App settings
So you need all 3 running:


Ollama          PostgreSQL       Backend          Frontend
────────        ──────────       ───────          ────────
Already         Already          cd server        cd agent
running ✓       running ✓        npm run dev      npm run dev

Port 11434      Port 5432        Port 3001        Port 5173
Check your server terminal — does it show:


Migrations complete
Server running on http://localhost:3001



------------------------------------
How to checkin postgresql store?
------------------------------------
In pgAdmin 4:

Step 1 — Open pgAdmin 4

Step 2 — Expand in the left panel:


Servers → PostgreSQL 18 → Databases → igsagent → Schemas → public → Tables
You should see 3 tables:

conversations
messages
settings
Step 3 — View data inside a table:

Right-click messages → View/Edit Data → All Rows

You will see all messages stored there.

Or use Query Tool:

Click on igsagent database
Top menu → Tools → Query Tool
Paste and press F5:

SELECT * FROM messages;

SELECT * FROM conversations;
If tables don't exist yet → your backend server was never started successfully. Run:


------------------------------------
okay what if i don't to use postgresql. i mean i use only Ollama for hlep. so the data it will write back but not store in history right? For exmaple i say hi then agent say hi back. but the data it not store in history right?
------------------------------------
Yes, exactly! If you remove PostgreSQL, every conversation starts fresh — no memory.

Want me to rewrite the backend to work without PostgreSQL? Just Ollama only.

It will:

✅ Chat with Ollama and stream responses
✅ Keep messages in memory while the page is open
❌ No history saved — refresh = everything gone
❌ No conversation list in sidebar

------------------------------------
if i shudown my laptop window. then i open again i need to run ollama again or not?
------------------------------------
Summary
Your project is already 40% complete. The remaining features can be built in phases. Each phase is independent so you can stop anytime.

Which phase do you want to start with?

Type Phase 1 → Easy features (scroll button, dark mode, voice)
Type Phase 2 → Export + share link
Type Phase 3 → File upload + RAG
Type a specific feature name to build just that one