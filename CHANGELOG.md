# Changelog

All notable changes to ContentIQ will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- [ ] User authentication & saved analyses
- [ ] Export analysis reports (PDF)
- [ ] Real-time collaboration features
- [ ] Advanced RAG with hierarchical summarization
- [ ] Multimodal RAG (video frames + audio)
- [ ] GitHub Actions CI/CD pipeline
- [ ] Unit test coverage

---

## [1.0.0] - 2026-06-01

### 🎉 Initial Release

**ContentIQ v1.0** — AI-Powered YouTube Video Intelligence Platform

#### Added

##### Frontend
- ✨ **Hero Section** — 3400-particle animation with mouse interaction
  - Pre-rendered sprite glows (60fps stable)
  - Spring physics with damping (0.042, 0.92)
  - Tagbox cycling through 4 messages
  - Smooth scroll hints and animations

- ✨ **Analyze Section** — URL comparison form
  - Dual video URL inputs (A/B labeled)
  - Real-time status messages
  - Spinner animation during processing
  - Error handling with user-friendly messages

- ✨ **How It Works** — Constellation diagram
  - 8 connected nodes (YouTube → RAG Pipeline)
  - Animated section connectors with draw-in effects
  - Dashed constellation lines with flowing animation
  - Responsive grid layout

- ✨ **Dashboard** — Side-by-side comparison
  - Video metadata cards (title, creator, stats)
  - Engagement rate comparison with visual bars
  - Views, likes, comments, duration
  - Color-coded (cyan for A, purple for B)

- ✨ **RAG Chat** — Streaming AI analyst
  - Real-time token streaming with typewriter effect
  - Citation markers [[1]], [[2]] for sources
  - Suggested questions (chips/pills)
  - Conversation history preservation
  - Empty state with helpful prompts

##### Backend
- 🧠 **RAG Pipeline** (`services/ragService.js`)
  - Transcript extraction (youtube-transcript)
  - Smart chunking with overlap (~512 tokens)
  - Vector embeddings (MiniLM-L6-v2, 384-dim)
  - ChromaDB integration for vector storage
  - Query-based retrieval (top-2 chunks per video)
  - Groq LLM streaming (llama-3.1-8b-instant)

- 📊 **Video Analysis** (`services/metadataService.js`)
  - YouTube metadata extraction (views, likes, comments)
  - Instagram metadata scraping (best-effort)
  - Engagement rate calculation: `(likes+comments)/views*100`
  - Graceful fallbacks for missing data

- 🔄 **Vector Storage** (`services/vectorService.js`)
  - ChromaDB integration (local Docker)
  - Separate collections per video (no bias)
  - Metadata tagging (video_id, chunk_index, source_url)
  - Efficient similarity search

- 🚀 **API Endpoints**
  - `POST /api/analyze` — Compare two videos
  - `POST /api/chat` — Stream RAG responses (SSE)
  - `GET /api/metadata` — Retrieve cached analysis
  - `GET /health` — Server health check

- 🛡️ **Infrastructure**
  - Express.js with CORS & rate limiting (120 req/15min)
  - Environment variable configuration
  - Error handling & logging
  - In-memory session store (demo mode)
  - Docker-compose setup for ChromaDB

##### Documentation
- 📚 **README.md** — Project overview, quick start, tech stack
- 📖 **SETUP.md** — Step-by-step installation guide
- 🏗️ **ARCHITECTURE.md** — System design & data flow
- 📋 **API.md** — Endpoint reference with cURL examples
- ⚡ **PERFORMANCE.md** — Optimization breakdown (3.2x improvement)
- 🧠 **RAG.md** — Complete RAG pipeline explanation
- 🤝 **CONTRIBUTING.md** — Contribution guidelines
- 📝 **CHANGELOG.md** — Version history
- ©️ **LICENSE** — MIT License

##### Configuration
- 📄 **.env.example** — Template environment variables
- 🐳 **docker-compose.yml** — ChromaDB setup
- .gitignore — Proper git exclusions

#### Technical Highlights

- **Performance:** 60fps particle animation (optimized from 15-20fps)
- **Latency:** <2s RAG pipeline, streaming reduces perceived latency to <0.5s
- **Bundle:** 251KB gzipped (React + Vite optimizations)
- **Scalability:** Designed for ~1000 creators/day
- **Cost:** Free tier friendly (Groq, MiniLM local, ChromaDB local)

#### Known Limitations

- Instagram scraping is best-effort (many environments block)
- YouTube Data API not integrated (no official stats)
- In-memory session store (no persistence between restarts)
- Text-only (no video frame analysis)
- English-only transcripts

#### Dependencies

**Backend:**
- express, cors, dotenv, express-rate-limit
- @google/generative-ai, groq-sdk
- chromadb, @xenova/transformers
- youtube-transcript, axios, cheerio

**Frontend:**
- react, react-router-dom, tailwindcss, vite

**DevOps:**
- docker, docker-compose
- nodemon (dev)

---

## Version Numbering

- `1.0.0` — Official release
- `1.1.0` — Feature additions (backward compatible)
- `1.0.1` — Bug fixes (backward compatible)
- `2.0.0` — Breaking changes

---

## Upgrade Guide

### From Pre-Release to 1.0.0

No breaking changes. Simply pull latest and run:

```bash
npm install
npm --prefix server install
npm --prefix client install
docker-compose up -d
npm run dev
```

---

## Security Considerations

### v1.0.0

- ✅ No hardcoded API keys
- ✅ Environment variables for sensitive data
- ✅ .env in .gitignore
- ⚠️ No user authentication (open API)
- ⚠️ Rate limiting only (not full auth)

### Planned for v1.1.0

- [ ] User authentication (JWT)
- [ ] API key management
- [ ] Audit logging
- [ ] HTTPS enforcement (prod)

---

## Support

### Getting Help

- 📖 Read the [SETUP.md](./SETUP.md) for installation issues
- 🐛 Check [GitHub Issues](https://github.com/RachitMittal-20/ContentIQ/issues)
- 💬 Start a [Discussion](https://github.com/RachitMittal-20/ContentIQ/discussions)
- 📧 Email maintainer: rachitmittalxc@gmail.com

### Reporting Bugs

Use [GitHub Issues](https://github.com/RachitMittal-20/ContentIQ/issues) with:
- OS & Node version
- Steps to reproduce
- Expected vs actual behavior
- Error messages & screenshots

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

We welcome:
- 🐛 Bug reports & fixes
- ✨ Feature suggestions & implementations
- 📖 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations

---

## Acknowledgments

**ContentIQ** is built with:
- [ChromaDB](https://www.trychroma.com/) — Vector storage
- [Groq](https://groq.com/) — Fast LLM inference
- [Google Gemini](https://ai.google.dev/) — Generative AI
- [MiniLM](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) — Embeddings
- [React](https://react.dev/) + [Vite](https://vitejs.dev/) — Frontend
- [Express.js](https://expressjs.com/) — Backend

Special thanks to [Techsolv IT](https://www.techsolv.it/) for the internship opportunity.

---

## License

MIT License © 2026 Rachit Mittal

See [LICENSE](./LICENSE) for details.
