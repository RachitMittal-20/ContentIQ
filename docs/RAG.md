# ContentIQ RAG Implementation

Complete guide to the Retrieval-Augmented Generation (RAG) pipeline used in ContentIQ.

---

## 📚 What is RAG?

**Retrieval-Augmented Generation (RAG)** is an AI architecture that combines:

1. **Information Retrieval** — Find relevant documents/chunks
2. **Generative AI** — Generate responses based on retrieved context

### Traditional LLM vs RAG

**Traditional LLM** (e.g., ChatGPT):
```
User: "What did the video say about engagement?"
↓
LLM searches its training data (trained on data up to April 2024)
↓
Response: "I don't have specific information about your video."
❌ Problem: Can't access custom documents, may hallucinate
```

**RAG Approach** (ContentIQ):
```
User: "What did the video say about engagement?"
↓
1. Embed question into vector space
2. Search document database for similar chunks
3. Retrieve relevant transcript portions
4. Pass question + context to LLM
↓
Response: "The video mentioned that engagement was 4.74%... [[1]]"
✅ Benefit: Grounded in actual content, sources cited
```

---

## 🏗️ ContentIQ RAG Architecture

### High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                         │
│  1. Paste YouTube URLs in UI                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  ANALYSIS PHASE                             │
│                                                             │
│  Step 1: Fetch Transcripts                                 │
│  ├─ youtube-transcript npm package                         │
│  ├─ Extract subtitles from YouTube                         │
│  └─ Result: Raw text transcript                            │
│                                                             │
│  Step 2: Chunk Transcripts                                 │
│  ├─ Split into 512-token overlapping segments              │
│  ├─ Overlap: 50 tokens (context preservation)              │
│  └─ Result: [chunk1, chunk2, chunk3, ...]                 │
│                                                             │
│  Step 3: Generate Embeddings                               │
│  ├─ Model: MiniLM-L6-v2 (lightweight, 384-dim)             │
│  ├─ Embed each chunk to vector space                       │
│  └─ Result: [[0.234, -0.123, ...], [...], ...]            │
│                                                             │
│  Step 4: Store in Vector Database                          │
│  ├─ Database: ChromaDB (running in Docker)                 │
│  ├─ Store: vectors + metadata (chunk text, timestamp)      │
│  └─ Result: Ready for search                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    CHAT PHASE                               │
│                                                             │
│  Step 5: User Asks Question                                │
│  ├─ Input: "Which video had better engagement?"            │
│  └─ Question stored in chat history                        │
│                                                             │
│  Step 6: Embed Question                                    │
│  ├─ Same model (MiniLM-L6-v2) embeds the question         │
│  └─ Result: [0.156, -0.234, ...] (same 384-dim space)    │
│                                                             │
│  Step 7: Search Vector Database                            │
│  ├─ Cosine similarity: distance(Q, chunk_vectors)          │
│  ├─ Retrieve: Top 3 most similar chunks                    │
│  └─ Result: Relevant context from both videos              │
│                                                             │
│  Step 8: Build LLM Prompt                                  │
│  ├─ Input:                                                 │
│  │   - User question                                       │
│  │   - Retrieved chunks with citations [[1]], [[2]]        │
│  │   - Chat history for context                            │
│  ├─ System prompt: "Answer using ONLY the provided text"   │
│  └─ Result: Complete prompt for LLM                        │
│                                                             │
│  Step 9: Call Gemini LLM                                   │
│  ├─ Model: Gemini 1.5 Flash (fast + efficient)             │
│  ├─ Temperature: 0.7 (balanced creativity/accuracy)        │
│  └─ Result: Token-by-token response                        │
│                                                             │
│  Step 10: Stream Response to User                          │
│  ├─ Protocol: Server-Sent Events (SSE)                     │
│  ├─ Each token sent as soon as generated                   │
│  └─ Result: Fluent, real-time appearance                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Key Components Explained

### 1. Transcript Extraction
- **Method**: youtube-transcript npm package
- **Duration**: 1.5-2.3 seconds per video
- **Format**: Plain text with optional timestamps
- **Fallback**: Gracefully handles videos without transcripts

### 2. Chunking Strategy
- **Size**: 512 tokens per chunk
- **Overlap**: 50 tokens (preserves context at boundaries)
- **Result**: 2000-5000 chunks per video

### 3. Embedding Model: MiniLM-L6-v2
- **Dimension**: 384 (compact yet effective)
- **Speed**: 2-3ms per chunk
- **Quality**: Excellent semantic similarity detection
- **Size**: 22MB (lightweight)

### 4. Vector Database: ChromaDB
- **Storage**: Vectors + metadata + original text
- **Search**: Cosine similarity with O(log n) complexity
- **Scalability**: Handles millions of vectors efficiently
- **Persistence**: Docker volume mount for durability

### 5. LLM: Gemini 1.5 Flash
- **Speed**: <1.2s per response
- **Accuracy**: Grounded in retrieved context
- **Streaming**: Token-by-token output via SSE
- **Temperature**: 0.7 (factual but natural)

---

## 🎯 RAG Workflow Step-by-Step

### Analysis Phase (One-time, when videos submitted)

**Step 1-4**: Extract → Chunk → Embed → Store
```
Input: 2 YouTube URLs
│
├─→ Extract transcripts (2.3s)
├─→ Chunk into 512-token segments
├─→ Generate embeddings (MiniLM)
├─→ Store in ChromaDB
│
Output: Ready for questions
```

### Chat Phase (Repeatable, for each question)

**Step 5-10**: Question → Retrieve → Prompt → LLM → Stream
```
Input: "Which video had better engagement?"
│
├─→ Embed question (150ms)
├─→ Search ChromaDB for similar chunks (120ms)
├─→ Get top 3 chunks with highest similarity
├─→ Construct prompt with context
├─→ Call Gemini LLM (1200ms)
├─→ Stream tokens back via SSE (100ms per token)
│
Output: "The first video [[1]] had 1.27% engagement..."
```

---

## 💡 Why RAG Solves Real Problems

### Problem 1: Hallucination
```
Without RAG:
Q: "What was the engagement rate?"
A: "I don't know your specific video. Typical YouTube engagement is 1-5%."
→ Generic, not accurate for YOUR videos

With RAG:
Q: "What was the engagement rate?"
A: "The first video had 4.74% engagement [[1]]."
→ Specific, grounded in actual transcript
```

### Problem 2: Knowledge Cutoff
```
Without RAG:
Q: "What did the latest video say?"
A: "I can only know about videos from my training data (cutoff April 2024)."
→ Can't analyze new videos

With RAG:
Q: "What did the latest video say?"
A: "According to the transcript, the latest video mentioned..."
→ Works for any video, any time
```

### Problem 3: Source Attribution
```
Without RAG:
A: "The video mentioned increasing engagement..."
→ Where? When? Not clear.

With RAG:
A: "The video mentioned increasing engagement [[1]] from 2% to 4.74% [[2]]..."
→ You can see the exact source chunks
```

---

## 📊 Vector Space Visualization

Imagine all transcripts mapped to a multi-dimensional space:

```
Semantic Similarity Space (simplified to 2D for visualization):

                    Engagement ↑
                         |
    Low engagement   ·····|····· High engagement
    chunks               ·|·
              ·    Q     · | ·
           ·              ·|·    ·
        ·           chunk1· ◄────── Retrieved (similar)
       ·                   |  ·
    ·                      | (·)
   ·        chunk3·········|····· chunk2 ← Retrieved
 ·                        ·|··
                         ·|
                        ·

Q = User question
chunk1, chunk2 = High similarity (retrieved for context)
chunk3 = Low similarity (ignored)
```

**Cosine Similarity Scores**:
- 0.95 = Nearly identical meaning
- 0.85 = Very similar
- 0.70 = Similar topics
- 0.50 = Related topics
- 0.30 = Different topics
- 0.05 = Unrelated

---

## 🔧 Implementation Details

### Embedding Generation
```javascript
// MiniLM-L6-v2 transforms text → 384-dimensional vector
Input:  "The engagement rate was 4.74%"
Output: [0.234, -0.123, 0.456, ..., 0.789]  // 384 numbers
```

### Similarity Search
```javascript
// Find chunks most similar to question
Question:   [0.156, -0.234, 0.567, ...]
Chunk 1:    [0.154, -0.231, 0.570, ...] → Similarity: 0.923 ✅
Chunk 2:    [0.012, 0.876, -0.234, ...] → Similarity: 0.031 ❌
Chunk 3:    [0.159, -0.240, 0.565, ...] → Similarity: 0.918 ✅
```

### Prompt Construction
```
System: "Answer using ONLY the provided context..."

Context:
[[1]] "The first video had 1M views, 50K likes..."
[[2]] "Engagement rate = (likes + comments) / views"
[[3]] "The second video had 309K views, 2.4K likes..."

User: "Which video had better engagement?"