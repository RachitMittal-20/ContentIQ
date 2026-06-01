````markdown
# ContentIQ API Reference

Complete endpoint documentation for ContentIQ backend.

## Base URL

**Development:** `http://localhost:3001`  
**Production:** (Your Render URL here)

## Authentication

Currently no authentication required for v1. All endpoints are public.

**Future:** Will implement API key authentication for production.

---

## POST `/api/analyze`

Compare two YouTube/Instagram videos and extract insights.

### Request

```json
{
  "videoA": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "videoB": "https://www.youtube.com/watch?v=jNQXAC9IVRw"
}
```

**Parameters:**
- `videoA` (string, required): YouTube or Instagram video URL
- `videoB` (string, required): YouTube or Instagram video URL

### Response (200 OK)

```json
{
  "success": true,
  "metadataA": {
    "videoId": "dQw4w9WgXcQ",
    "title": "Sample Video A",
    "creatorName": "Creator A",
    "views": 1000000,
    "likes": 50000,
    "comments": 5000,
    "engagementRate": 5.5,
    "uploadDate": "2025-01-15",
    "duration": 240,
    "sourceType": "youtube",
    "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
  },
  "metadataB": {
    "videoId": "jNQXAC9IVRw",
    "title": "Sample Video B",
    "creatorName": "Creator B",
    "views": 500000,
    "likes": 25000,
    "comments": 2500,
    "engagementRate": 5.5,
    "uploadDate": "2025-01-10",
    "duration": 180,
    "sourceType": "youtube",
    "thumbnail": "https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg"
  }
}
```

### Response (400 Bad Request)

```json
{
  "success": false,
  "error": "videoA and videoB are required"
}
```

### Response (500 Server Error)

```json
{
  "success": false,
  "error": "Failed to analyze videos"
}
```

### cURL Example

```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "videoA": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "videoB": "https://www.youtube.com/watch?v=jNQXAC9IVRw"
  }'
```

### JavaScript Example

```javascript
const response = await fetch('http://localhost:3001/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoA: 'https://www.youtube.com/watch?v=...',
    videoB: 'https://www.youtube.com/watch?v=...'
  })
});

const data = await response.json();
console.log(data);
```

### What Happens

1. **Fetch Transcripts** — Extracts YouTube transcripts using `youtube-transcript` package
2. **Fetch Metadata** — Gets views, likes, comments, duration, creator info
3. **Compute Engagement** — Calculates: `(likes + comments) / views * 100`
4. **Chunk Transcript** — Splits text into ~512-token segments with overlap
5. **Embed Chunks** — Converts each chunk to 384-dim vector using MiniLM
6. **Store in ChromaDB** — Saves vectors in `video_a_chunks` and `video_b_chunks` collections
7. **Return Metadata** — Sends back comparison data to frontend

### Processing Time

- Small transcripts (5-10 min): ~2-4 seconds
- Large transcripts (30+ min): ~8-15 seconds

**Note:** First request takes longer due to model loading. Subsequent requests are faster.

---

## POST `/api/chat` (Server-Sent Events)

Stream RAG-powered responses as tokens arrive in real-time.

### Request

```json
{
  "message": "Which video had better engagement?",
  "history": [
    {
      "role": "user",
      "content": "What's the difference between these videos?"
    },
    {
      "role": "assistant",
      "content": "Video A has a 5.5% engagement rate compared to Video B's 5.5%..."
    }
  ],
  "metadata": {
    "A": {
      "title": "Video A Title",
      "creatorName": "Creator A",
      "engagementRate": 5.5
    },
    "B": {
      "title": "Video B Title",
      "creatorName": "Creator B",
      "engagementRate": 5.5
    }
  }
}
```

**Parameters:**
- `message` (string, required): User question
- `history` (array, optional): Previous chat messages for context
- `metadata` (object, optional): Video metadata for context injection

### Response (SSE Stream)

The response is streamed as **Server-Sent Events (SSE)**. Each token arrives as:

```
data: {"token":"The"}
data: {"token":" first"}
data: {"token":" video"}
data: {"token":" has"}
data: {"token":" better"}
data: {"token":" engagement"}
...
data: {"done":true}
```

### cURL Example

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Why did A outperform B?",
    "history": [],
    "metadata": {
      "A": {"title": "Video A", "engagementRate": 5.5},
      "B": {"title": "Video B", "engagementRate": 5.5}
    }
  }'
```

### JavaScript Example (Stream Handling)

```javascript
async function streamChat() {
  const response = await fetch('http://localhost:3001/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Why did A outperform B?',
      history: [],
      metadata: {
        A: { title: 'Video A', engagementRate: 5.5 },
        B: { title: 'Video B', engagementRate: 5.5 }
      }
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const json = JSON.parse(line.slice(6));
        if (json.done) {
          console.log('Chat complete');
        } else {
          console.log(json.token);
          // Append token to UI
        }
      }
    }
  }
}
```

### What Happens

1. **Query ChromaDB** — Retrieves top 2 chunks from each video
2. **Build Context** — Combines relevant transcript excerpts
3. **Create Prompt** — System prompt includes video metadata + context
4. **Stream from Groq** — Uses `llama-3.1-8b-instant` with streaming
5. **Return Tokens** — Sends each token as SSE event

### Token Budget

- Max response: 512 tokens (~400 words)
- Temperature: 0.4 (focused, deterministic)
- Context window: Entire transcript + chat history

---

## GET `/api/metadata`

Retrieve the latest analysis metadata (cached from last `/analyze` call).

### Response (200 OK)

```json
{
  "success": true,
  "lastRunAt": "2026-06-01T16:45:22.123Z",
  "metadataA": {
    "videoId": "dQw4w9WgXcQ",
    "title": "Video A",
    "creatorName": "Creator A",
    "views": 1000000,
    "likes": 50000,
    "comments": 5000,
    "engagementRate": 5.5
  },
  "metadataB": {
    "videoId": "jNQXAC9IVRw",
    "title": "Video B",
    "creatorName": "Creator B",
    "views": 500000,
    "likes": 25000,
    "comments": 2500,
    "engagementRate": 5.5
  }
}
```

### cURL Example

```bash
curl http://localhost:3001/api/metadata
```

### Use Case

Reload page without re-analyzing. Quick access to cached results.

---

## GET `/health`

Health check endpoint for monitoring.

### Response (200 OK)

```json
{ "ok": true }
```

### cURL Example

```bash
curl http://localhost:3001/health
```

---

## Error Codes

| Code | Error | Meaning | Solution |
|------|-------|---------|----------|
| 400 | Bad Request | Missing required fields | Check request body |
| 404 | Not Found | Endpoint doesn't exist | Check URL spelling |
| 429 | Rate Limited | Too many requests | Wait 15 minutes or increase limit |
| 500 | Server Error | Backend crashed | Check server logs |
| ChromaDB Error | Vector DB unreachable | Docker not running | `docker-compose up -d` |
| Groq/Gemini Error | API key invalid/quota exceeded | Check `.env` keys | Regenerate API keys |

---

## Rate Limiting

- **Window:** 15 minutes
- **Limit:** 120 requests per IP
- **Header:** `X-RateLimit-Remaining` shows remaining requests

---

## Response Headers

```
Content-Type: application/json (or text/event-stream for /chat)
Cache-Control: no-cache
Connection: keep-alive
X-RateLimit-Remaining: 119
```

---

## Example Workflow

```bash
# Step 1: Analyze two videos
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"videoA":"https://...", "videoB":"https://..."}'

# Step 2: Get cached metadata
curl http://localhost:3001/api/metadata

# Step 3: Stream chat response
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Why did A outperform B?"}'
```

---

## Webhooks & Async (Future)

Not currently supported. Streaming responses recommended for real-time feedback.

---

## Contact & Support

- 📧 Issues: https://github.com/RachitMittal-20/ContentIQ/issues
- 💬 Discussions: https://github.com/RachitMittal-20/ContentIQ/discussions
````
