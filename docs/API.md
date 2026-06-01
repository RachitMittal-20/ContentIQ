# ContentIQ API Reference

Complete documentation of all ContentIQ API endpoints.

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://contentiq-api.render.com` (when deployed)

## Authentication

No authentication required for v1. (Consider adding API keys for production).

---

## Endpoints Overview

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/api/analyze` | Compare 2 YouTube videos | ✅ Working |
| POST | `/api/chat` | Stream RAG chat responses | ✅ Working |
| GET | `/api/metadata` | Get previous analysis data | ✅ Working |
| GET | `/health` | Health check | ✅ Working |

---

## 1️⃣ POST `/api/analyze`

Compare and analyze two YouTube videos.

### Request

```json
{
  "videoA": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "videoB": "https://www.youtube.com/watch?v=jNQXAC9IVRw"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "metadataA": {
    "videoId": "dQw4w9WgXcQ",
    "title": "Never Gonna Give You Up",
    "channel": "Rick Astley",
    "views": 1328370935,
    "likes": 15400000,
    "comments": 2500000,
    "duration": 212,
    "engagementRate": 1.27,
    "transcript": "We're no strangers to love..."
  },
  "metadataB": {
    "videoId": "jNQXAC9IVRw",
    "title": "Me at the zoo",
    "channel": "jawed",
    "views": 309858254,
    "likes": 2400000,
    "comments": 500000,
    "duration": 18,
    "engagementRate": 0.92,
    "transcript": "Alright, so here we are..."
  }
}
```

### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": "Invalid YouTube URL format. Please use full YouTube URLs (https://www.youtube.com/watch?v=...)"
}
```

### Error Response (429 Too Many Requests)

```json
{
  "success": false,
  "error": "Rate limit exceeded. Maximum 120 requests per 15 minutes."
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

### JavaScript/Fetch Example

```javascript
const analyzeVideos = async (videoA, videoB) => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoA, videoB })
    });
    
    if (!response.ok) throw new Error('Analysis failed');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

---

## 2️⃣ POST `/api/chat`

Stream RAG-powered chat responses using Server-Sent Events (SSE).

### Request

```json
{
  "message": "Which video had better engagement?",
  "history": [
    {
      "role": "user",
      "content": "What's the difference between the videos?"
    },
    {
      "role": "assistant",
      "content": "The first video has significantly higher engagement metrics with 1.27% engagement rate compared to 0.92% for the second video."
    }
  ]
}
```

### Response (200 OK - SSE Stream)

The response comes as Server-Sent Events. Each event is a JSON object with tokens:

```
data: {"token": "The"}
data: {"token": " first"}
data: {"token": " video"}
data: {"token": " [[1]]"}
data: {"token": " clearly"}
data: {"token": " outperformed"}
...
data: {"done": true}
```

**Note**: `[[1]]` refers to citation index 1 (transcript source).

### cURL Example

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Which video had better engagement?",
    "history": []
  }'
```

Output will stream as SSE events. To capture them:

```bash
curl -N -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Which video had better engagement?",
    "history": []
  }' | while IFS= read -r line; do
    echo "$line"
  done
```

### JavaScript/EventSource Example

```javascript
const streamChat = async (message, history) => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.token) {
              fullText += data.token;
              console.log(data.token); // Display token in UI
            }
            if (data.done) {
              console.log('Response complete');
              return fullText;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error) {
    console.error('Chat error:', error);
  }
};
```

### Citations Format

The response includes citations like `[[1]]`, `[[2]]`, etc. These refer to source transcript chunks:

```
"The first video [[1]] had significantly higher engagement [[2]]..."

// Later in response:
"Sources:
[1] Video A - 01:23 - The first video had 1M views
[2] Video A - 02:45 - Engagement metrics show 1.27% rate"
```

---

## 3️⃣ GET `/api/metadata`

Retrieve metadata from the most recent video analysis.

### Response (200 OK)

```json
{
  "success": true,
  "metadataA": {
    "videoId": "dQw4w9WgXcQ",
    "title": "Never Gonna Give You Up",
    "channel": "Rick Astley",
    "views": 1328370935,
    "likes": 15400000,
    "comments": 2500000,
    "duration": 212,
    "engagementRate": 1.27
  },
  "metadataB": {
    "videoId": "jNQXAC9IVRw",
    "title": "Me at the zoo",
    "channel": "jawed",
    "views": 309858254,
    "likes": 2400000,
    "comments": 500000,
    "duration": 18,
    "engagementRate": 0.92
  }
}
```

### Error Response (404 Not Found)

```json
{
  "success": false,
  "error": "No previous analysis found. Run /api/analyze first."
}
```

### cURL Example

```bash
curl http://localhost:3001/api/metadata
```

### JavaScript Example

```javascript
const getPreviousAnalysis = async () => {
  try {
    const response = await fetch('/api/metadata');
    const data = await response.json();
    
    if (data.success) {
      console.log('Video A:', data.metadataA.title);
      console.log('Video B:', data.metadataB.title);
      return data;
    } else {
      console.log(data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 4️⃣ GET `/health`

Check if the API server is running and healthy.

### Response (200 OK)

```json
{
  "status": "ok",
  "timestamp": "2026-06-01T21:30:00Z",
  "chromadb": "connected",
  "gemini": "ready"
}
```

### cURL Example

```bash
curl http://localhost:3001/health
```

---

## Error Handling

### HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | Success | Analysis complete |
| 400 | Bad Request | Invalid URL format |
| 429 | Rate Limited | Too many requests |
| 500 | Server Error | Gemini API down, ChromaDB error |
| 503 | Service Unavailable | Database connection lost |

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid YouTube URL format" | URL not recognized | Use full URL: `https://www.youtube.com/watch?v=...` |
| "Failed to fetch transcript" | Video has no transcript | Choose a different video |
| "Rate limit exceeded" | Too many requests | Wait 15 minutes |
| "ChromaDB connection failed" | Database not running | Run `docker-compose up -d` |
| "Gemini API error" | API key invalid or quota exceeded | Check GEMINI_API_KEY in .env |

---

## Rate Limiting

- **Limit**: 120 requests per 15 minutes
- **Header**: `X-RateLimit-Remaining`
- **Retry-After**: Returns 429 status if exceeded

---

## Example: Complete Flow

```javascript
// 1. Analyze two videos
const analysis = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoA: 'https://www.youtube.com/watch?v=...',
    videoB: 'https://www.youtube.com/watch?v=...'
  })
}).then(r => r.json());

console.log('Video A engagement:', analysis.metadataA.engagementRate);
console.log('Video B engagement:', analysis.metadataB.engagementRate);

// 2. Ask a question about the videos
const chatResponse = await streamChat(
  'Which video had better engagement?',
  []
);

console.log('Answer:', chatResponse);

// 3. Later, load previous analysis
const previous = await fetch('/api/metadata').then(r => r.json());
console.log('Previous analysis:', previous.metadataA.title);
```

---

## Testing with Postman

[Download Postman](https://www.postman.com/downloads/) and import this collection:

```json
{
  "info": {
    "name": "ContentIQ API",
    "version": "1.0.0"
  },
  "item": [
    {
      "name": "Analyze Videos",
      "request": {
        "method": "POST",
        "url": "http://localhost:3001/api/analyze",
        "body": {
          "videoA": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          "videoB": "https://www.youtube.com/watch?v=jNQXAC9IVRw"
        }
      }
    },
    {
      "name": "Chat",
      "request": {
        "method": "POST",
        "url": "http://localhost:3001/api/chat",
        "body": {
          "message": "Which video had better engagement?",
          "history": []
        }
      }
    },
    {
      "name": "Get Metadata",
      "request": {
        "method": "GET",
        "url": "http://localhost:3001/api/metadata"
      }
    },
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:3001/health"
      }
    }
  ]
}
```

---

## Troubleshooting API Issues

**Problem**: API returns 500 error
```
Solution:
1. Check ChromaDB is running: docker-compose ps
2. Verify GEMINI_API_KEY in .env
3. Check server logs for detailed error
4. Restart server: npm run dev
```

**Problem**: Chat response has no sources
```
Solution:
1. Ensure transcripts were properly extracted
2. Check ChromaDB has vectors: curl http://localhost:8000/api/v1/heartbeat
3. Try re-analyzing videos
```

**Problem**: Rate limiting kicked in
```
Solution:
1. Wait 15 minutes for limit to reset
2. For production, add API key authentication
3. Implement request queuing on frontend
```

---

## API Versioning

Currently: **v1** (no version prefix)

Future versions may add `/api/v2/...` endpoints while maintaining backward compatibility.

---

**Last Updated**: 2026-06-01  
**Maintainer**: Rachit Mittal
