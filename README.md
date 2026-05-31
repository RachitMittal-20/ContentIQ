# ContentIQ

## Project Overview
ContentIQ is a Creator Intelligence Platform that compares two social videos (YouTube + Instagram Reels) and lets creators ask a RAG chatbot for data-backed explanations. The app fetches transcripts + metadata, embeds transcript chunks into ChromaDB, and streams Gemini Flash responses with source citations.

## Architecture Diagram
```text
[Frontend (React)]
   |  POST /api/analyze { videoA, videoB }
   v
[Express Backend]
   |-- transcriptService --> YouTube transcript + Instagram metadata (scrape w/ fallback)
   |-- metadataService -----> engagement rate + basic fields
   |-- chunker -------------> transcript chunking (512-ish tokens; char-based approximation)
   |-- vectorService ------> ChromaDB upsert (collections: video_a_chunks / video_b_chunks)
   |-- store.js ----------- > in-memory metadata for dashboard

   |  POST /api/chat { message, history }
   |-- vectorService ------> balanced retrieval (top 2 chunks per video)
   |-- Gemini Flash --------> streaming generation
   v
[Frontend]
   |-- SSE reader ---------> token-by-token UI streaming + citations
```

## Tech Decisions & Trade-offs
- **ChromaDB vs Pinecone**: ChromaDB runs locally (via Docker), zero cost and no external network latency—ideal for an internship demo. Trade-off: no persistence between server restarts unless you manage volumes (we do via `docker-compose.yml`).
- **MiniLM embeddings (`@xenova/transformers`) vs OpenAI embeddings**: MiniLM is free and runs locally with no API key. Trade-off: slightly lower embedding quality than premium APIs; acceptable at this scale for English transcript QA.
- **Gemini Flash (`gemini-1.5-flash`) vs GPT-4o**: Flash provides fast streaming and is sufficient for Q&A over retrieval context. Trade-off: may require more careful prompting to reliably follow citation formatting.
- **Chunk size (~512 tokens) with overlap (~50 tokens)**: Chunking preserves coherent transcript segments; overlap prevents boundary context loss.
  - Note: this repo uses a **char-based** chunker to approximate token budgets without shipping a tokenizer. This keeps chunk sizes consistent enough for transcript text.
- **Separate collections per video** (`video_a_chunks`, `video_b_chunks`): prevents retrieval bias toward a single “bigger” transcript. We query each video collection independently and merge context.

## Scalability Analysis
For ~1000 creators/day:
- The **embedding step** is the bottleneck (local MiniLM CPU). Production would offload to a batch pipeline or an async worker.
- **ChromaDB**: for production-scale persistence/throughput, swap local Chroma to Qdrant Cloud or another managed vector DB.
- **Gemini Flash**: should fit within free-tier-like usage for Q&A workloads, assuming average chat lengths remain moderate.

## Known Limitations
- **Instagram scraping** is best-effort only. Many environments block requests; the backend falls back to mock metadata and documented notes.
- The **YouTube Data API** is not used in this scaffold (no API key). As a result:
  - views/likes/comments may be `0`
  - engagement rate can become `null` if views are unavailable
  - this keeps the app running without crashing, but reduces analytical fidelity.
  - Production solution: integrate YouTube Data API or RapidAPI/Apify for full stats.

## Setup Instructions
### Prerequisites
- Node.js 18+
- Docker (for ChromaDB)

### 1) Start ChromaDB
```bash
cd contentiq
docker-compose up -d
```
ChromaDB runs on `http://localhost:8000`.

### 2) Configure environment
Create `contentiq/.env` (or edit `.env.example`):
```bash
GEMINI_API_KEY=your_gemini_api_key
PORT=3001
CHROMA_URL=http://localhost:8000
NODE_ENV=development
```

### 3) Install dependencies
```bash
cd contentiq
npm install
npm --prefix client install
npm --prefix server install
```

### 4) Run the app
```bash
npm run dev
```
Frontend: `http://localhost:5173`
Backend: `http://localhost:3001`

## API Documentation
### POST `/api/analyze`
**Body**:
```json
{ "videoA": "<url>", "videoB": "<url>" }
```
**Behavior**:
- Fetch YouTube transcript (youtube-transcript)
- Attempt Instagram metadata scrape (axios+cheerio) with graceful fallback
- Compute engagement rate (formula: `(likes+comments)/views*100`, rounded to 2 decimals)
- Chunk transcript text
- Embed transcript chunks with MiniLM
- Store chunks in ChromaDB:
  - collection `video_a_chunks`
  - collection `video_b_chunks`
- Tag chunks with metadata: `{ video_id: "A"|"B", chunk_index, source_url }`

**Response**:
```json
{ "success": true, "metadataA": { ... }, "metadataB": { ... } }
```

### GET `/api/metadata`
**Response**:
```json
{
  "success": true,
  "lastRunAt": "<iso>",
  "metadataA": { ... },
  "metadataB": { ... }
}
```

### POST `/api/chat` (SSE)
**Headers**:
- `Content-Type: application/json`

**Body**:
```json
{
  "message": "Why did A outperform B?",
  "history": [{"role":"user","content":"..."}]
}
```
**Behavior**:
- Retrieve top 2 chunks from **each** video collection
- Build context with citations:
  - `[Source: Video A, chunk N] ...`
  - `[Source: Video B, chunk N] ...`
- Call Gemini Flash with streaming enabled

**Response** (SSE stream):
- `data: {"token":"<text>"}` token events
- final `data: {"done": true}`

## Implementation Notes
- Frontend consumes the SSE stream token-by-token to create a typewriter effect.
- Conversation memory is passed via the `history` array and injected into the Gemini prompt.

