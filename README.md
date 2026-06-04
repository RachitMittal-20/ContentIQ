# ContentIQ 🎬🤖

**AI-Powered YouTube Video Intelligence Platform**

[![Live Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](https://content-iq-lake.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18.0+-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.0+-blue)](https://react.dev/)

> Compare two YouTube videos side-by-side using AI. Get engagement metrics, transcript-backed answers via RAG chat, and real-time streaming responses — all in one platform.

**🔗 [Live Demo → content-iq-lake.vercel.app](https://content-iq-lake.vercel.app/)**

---

## Table of Contents

- [What It Does](#what-it-does)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [RAG Pipeline](#rag-pipeline)
- [API Reference](#api-reference)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Design Decisions & Trade-offs](#design-decisions--trade-offs)
- [Scalability Considerations](#scalability-considerations)
- [Known Limitations](#known-limitations)

---

## What It Does

ContentIQ takes two YouTube URLs, extracts their transcripts and metadata, stores them in a vector database, and lets you chat with the content using RAG.

**Core flows:**

1. **Analyze** — User submits two YouTube URLs → backend extracts transcripts via `youtube-transcript` npm + metadata via YouTube Data API v3 → chunks and embeds text → stores in ChromaDB → returns engagement metrics to dashboard
2. **Chat** — User asks a question → query is embedded → top-K chunks retrieved from ChromaDB → prompt built with context → Groq LLM streams back a cited answer via SSE

**Dashboard shows per-video:** views, likes, comments, engagement rate `((likes + comments) / views * 100)`, upload date, duration, creator name

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Vercel)                       │
│  React 18 + Vite │ Canvas Particles │ SSE Stream Reader │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS (POST /api/analyze, /api/chat)
┌────────────────────────▼────────────────────────────────┐
│                   SERVER (Render)                        │
│  Express.js                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ metadataService│  │transcriptSvc │  │  ragService   │  │
│  │ YouTube API v3│  │yt-transcript │  │  LangChain.js │  │
│  └──────────────┘  └──────┬───────┘  └──────┬────────┘  │
│                           │                  │           │
│              ┌────────────▼──────────────────▼────────┐  │
│              │         embeddingService               │  │
│              │    @xenova/transformers MiniLM-L6-v2   │  │
│              │         384-dim vectors                │  │
│              └───────────────────┬────────────────────┘  │
└──────────────────────────────────┼─────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────┐
│              ChromaDB (Docker / Render service)         │
│         Collections: video_A_chunks, video_B_chunks     │
└─────────────────────────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────┐
│                    Groq API                              │
│            llama-3.1-8b-instant (LLM)                   │
│            Streaming via SSE back to client             │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + Vite | Fast HMR, optimized builds, native ESM |
| Styling | Tailwind CSS + custom CSS vars | Utility-first, consistent dark theme |
| Animation | Canvas API (2D) | 3,400-particle hero, GPU-accelerated, 60fps |
| Streaming | SSE (Server-Sent Events) | One-directional, low overhead vs WebSocket for token streaming |
| Backend | Node.js + Express | Lightweight, async-native, good LangChain.js support |
| LLM | Groq API (llama-3.1-8b-instant) | Sub-second inference, free tier, fast enough for streaming UX |
| Embeddings | MiniLM-L6-v2 via @xenova/transformers | Runs in-process (no external API), 384-dim, strong semantic quality |
| Vector DB | ChromaDB | Simple REST API, Docker-friendly, good JS client support |
| Orchestration | LangChain.js | Prompt templating, retrieval chain abstractions |
| Transcripts | youtube-transcript npm | No auth required, reliable for most public videos |
| Metadata | YouTube Data API v3 | Official, structured stats (views/likes/comments/duration) |
| Deployment | Vercel (frontend) + Render (backend) | Zero-config deploys, free tier sufficient for demo |

---

## RAG Pipeline

```
User Question
      │
      ▼
Embed query with MiniLM-L6-v2
      │
      ▼
ChromaDB similarity search
  └── video_A collection  → top 3 chunks
  └── video_B collection  → top 3 chunks
      │
      ▼
Build prompt:
  System: "You are a video analyst. Answer using only the provided context.
           Cite which video each claim comes from."
  Context: [6 retrieved chunks with video labels]
  User: [original question]
      │
      ▼
Groq API (llama-3.1-8b-instant)
      │
      ▼
SSE stream → client renders token by token
```

**Chunking strategy:** Transcripts are split into ~500 character overlapping chunks (100 char overlap) to preserve sentence context across chunk boundaries.

**Embedding model choice:** MiniLM-L6-v2 was chosen over OpenAI `text-embedding-ada-002` to eliminate an external API dependency and keep the embedding step fully in-process. Trade-off: slightly lower semantic accuracy on highly domain-specific queries.

---

## API Reference

### `POST /api/analyze`

Extracts metadata + transcripts, embeds and stores in ChromaDB.

**Request:**
```json
{
  "videoA": "https://www.youtube.com/watch?v=VIDEO_ID_1",
  "videoB": "https://www.youtube.com/watch?v=VIDEO_ID_2"
}
```

**Response:**
```json
{
  "A": {
    "videoId": "VIDEO_ID_1",
    "title": "Video Title",
    "creatorName": "Channel Name",
    "views": 17500000,
    "likes": 322900,
    "comments": 5500,
    "engagementRate": 1.87,
    "uploadDate": "2023-04-12",
    "duration": "12:34",
    "thumbnail": "https://img.youtube.com/vi/VIDEO_ID_1/hqdefault.jpg",
    "topHashtags": ["comedy", "viral", "india"],
    "sourceType": "youtube"
  },
  "B": { ... }
}
```

**Errors:**

| Code | Reason |
|---|---|
| 400 | Missing or invalid YouTube URL |
| 404 | Video not found or transcript unavailable |
| 429 | Rate limit exceeded (120 req / 15 min) |
| 500 | YouTube API key invalid or quota exceeded |

---

### `POST /api/chat`

RAG chat — retrieves relevant chunks and streams an LLM response.

**Request:**
```json
{
  "message": "Which video had better audience engagement and why?",
  "history": [
    { "role": "user", "content": "previous question" },
    { "role": "assistant", "content": "previous answer" }
  ]
}
```

**Response:** SSE stream

```
data: {"token": "Video"}
data: {"token": " B"}
data: {"token": " had"}
...
data: {"done": true}
```

Each `data:` line is a JSON object. The stream terminates with `{"done": true}`.

---

### `GET /api/metadata`

Returns cached metadata for the currently analyzed videos.

**Response:** Same shape as `/api/analyze` response.

---

## Local Setup

### Prerequisites

- Node.js 18+
- Docker (for ChromaDB)
- YouTube Data API v3 key → [get one here](https://console.cloud.google.com/)
- Groq API key → [get one here](https://console.groq.com/)

### Steps

```bash
# 1. Clone
git clone https://github.com/RachitMittal-20/ContentIQ.git
cd ContentIQ

# 2. Start ChromaDB
docker-compose up -d
# Runs on http://localhost:8000

# 3. Backend
cd server
npm install
cp .env.example .env
# Fill in your keys (see Environment Variables below)
npm run dev
# Runs on http://localhost:3001

# 4. Frontend (new terminal)
cd client
npm install
npm run dev
# Opens http://localhost:5173
```

The Vite dev server proxies `/api/*` requests to `localhost:3001` — no CORS issues locally.

---

## Environment Variables

### Backend (`server/.env`)

```env
YOUTUBE_API_KEY=your_youtube_data_api_v3_key
GROQ_API_KEY=your_groq_api_key
CHROMA_HOST=localhost
CHROMA_PORT=8000
PORT=3001
```

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:3001
```

In production (Render), set `VITE_API_URL` to your Render backend URL.

---

## Design Decisions & Trade-offs

**Groq over Gemini**
Switched from Gemini API mid-build due to aggressive rate limiting on free tier (quota exhausted during development). Groq's llama-3.1-8b-instant offers comparable quality with much higher free-tier limits and noticeably lower latency.

**In-process embeddings over hosted API**
`@xenova/transformers` runs MiniLM-L6-v2 directly in the Node.js process. This eliminates an external API call on every analyze request and removes a potential failure point. The trade-off is ~50ms cold start for the model to load into memory on first use.

**ChromaDB over Pinecone**
ChromaDB runs locally in Docker and has no API key requirement, making it ideal for a demo/internship project. Pinecone would be the production choice for persistence, horizontal scaling, and managed uptime — ChromaDB's data is ephemeral per container restart.

**SSE over WebSockets**
Chat streaming is unidirectional (server → client), so SSE is the right primitive. WebSockets add bidirectional complexity that isn't needed here. SSE works natively with `fetch` and `EventSource` APIs.

**Per-session ChromaDB collections**
Each `/api/analyze` call creates new collections (`video_A_chunks`, `video_B_chunks`) and overwrites any previous ones. This is intentional — the app is designed for single-session comparison, not persistent video history.

---

## Scalability Considerations

The current architecture is designed for a single-user demo. At scale, these are the main bottlenecks and how they'd be addressed:

**ChromaDB**
Currently a single Docker container with in-memory + disk persistence. At scale, replace with a managed vector DB (Pinecone, Weaviate, Qdrant) that supports horizontal scaling and multi-tenant namespacing per user session.

**Embedding bottleneck**
`@xenova/transformers` runs synchronously in the main Express process. Under concurrent load this blocks the event loop. Fix: move embeddings to a worker thread pool (`worker_threads`) or a dedicated microservice.

**Transcript + API calls**
Each analyze request makes 2 YouTube API calls + 2 transcript fetches. At scale, cache results by `videoId` in Redis to avoid redundant API hits and stay within YouTube quota.

**LLM streaming**
Groq handles streaming well but has per-minute token limits. At scale, add a queue (BullMQ + Redis) to manage concurrent chat requests and implement per-user rate limiting.

**Session isolation**
Currently, collections are global (overwritten on each analyze call). Multi-user support would require namespaced collections per session ID.

---

## Known Limitations

- **Transcripts unavailable** for some videos (auto-captions disabled, private videos, or region-locked content). The app returns a graceful error in these cases.
- **YouTube API quota** is 10,000 units/day on the free tier. Each analyze call costs ~3 units. Heavy usage will exhaust the quota.
- **ChromaDB persistence** is lost on container restart. Re-analyzing the same videos is required after a Render cold start.
- **Long videos** (60+ min) may have transcripts that exceed the LLM's context window after retrieval. Mitigated by top-K chunk limiting, but very long transcripts may lose tail context.
- **Instagram metadata** is not supported. Meta blocks public API access to engagement data; [Apify](https://apify.com/) would be the production solution for Instagram scraping.

---

## Project Structure

```
contentiq/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx        # Video comparison cards
│   │   │   ├── ChatInterface.jsx    # RAG chat UI + SSE reader
│   │   │   └── LandingHero.jsx      # Canvas particle animation
│   │   └── App.jsx
│   └── vite.config.js               # Proxy config for local dev
│
├── server/                  # Node.js + Express backend
│   ├── services/
│   │   ├── metadataService.js       # YouTube Data API v3 calls
│   │   ├── transcriptService.js     # youtube-transcript + chunking
│   │   ├── embeddingService.js      # MiniLM-L6-v2 via @xenova/transformers
│   │   └── ragService.js            # ChromaDB retrieval + Groq streaming
│   ├── routes/
│   └── index.js
│
├── docker-compose.yml       # ChromaDB container
└── .env.example
```

---

## License

MIT — see [LICENSE](./LICENSE)

---

## Author

**Rachit Mittal** — B.Tech CSE, SRMIST Ghaziabad (2023–2027)

Built as a screening assignment for the Full Stack AI Engineer internship at Techsolv IT Service.

- GitHub: [@RachitMittal-20](https://github.com/RachitMittal-20)
