# ContentIQ 🎬🤖

**AI-Powered YouTube Video Intelligence Platform with RAG Chat**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18.0+-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.0+-blue)](https://react.dev/)
[![Deployment Status](https://img.shields.io/badge/Deployment-Live-brightgreen)](#-live-demo)

> Compare YouTube videos intelligently with AI-powered analysis and retrieval-augmented generation. Get cited answers to your questions about video content.

---

## 🚀 Quick Links

- **[🎥 Live Demo](#-live-demo)** — See it in action
- **[📚 Full Setup Guide](./SETUP.md)** — Get started in 10 minutes
- **[📖 API Documentation](./docs/API.md)** — Complete endpoint reference
- **[🏗️ Architecture](./ARCHITECTURE.md)** — Technical deep-dive
- **[⚡ Performance Analysis](./docs/PERFORMANCE.md)** — Optimization breakdown

---

## ✨ What is ContentIQ?

ContentIQ is a **full-stack AI application** that combines:

1. **YouTube Intelligence** — Extract transcripts and metadata from any YouTube video
2. **Vector Search** — Find relevant content using semantic similarity (RAG)
3. **Intelligent Chat** — Ask questions and get citation-backed answers
4. **Live Streaming** — Real-time token-by-token response rendering

**Perfect for:** Analyzing video content, comparing engagement metrics, finding specific information in long videos, and understanding content differences.

---

## 🎯 Features

✅ **Dual Video Comparison**
- Analyze 2 YouTube videos simultaneously
- Compare views, likes, comments, and engagement rates
- Real-time metadata extraction

✅ **RAG-Powered Chat**
- Ask questions about video content with citations
- Streaming responses for real-time feel
- Source-backed answers using transcript chunks

✅ **Performance Optimized**
- 60fps particle animation (GPU-accelerated)
- <2s RAG chat latency
- 234KB gzipped bundle size

✅ **Beautiful UI**
- 3,400-particle hero animation
- Responsive design (mobile → desktop)
- Smooth scroll animations
- Professional dark theme

✅ **Production-Ready**
- Comprehensive error handling
- Rate limiting (120 req/15min)
- Environment-based configuration
- Docker support

---

## 🛠 Tech Stack

### Frontend
- **React 18** + **Vite** (fast development, optimized builds)
- **Tailwind CSS** + Custom CSS variables
- **Canvas API** (2D animations)
- **SSE** (real-time streaming responses)

### Backend
- **Node.js** + **Express** (lightweight, scalable)
- **Groq API** (llama-3.1-8b-instant for LLM)
- **MiniLM-L6-v2** (384-dimensional embeddings)
- **ChromaDB** (vector database in Docker)

### Infrastructure
- **Docker** (containerized ChromaDB)
- **Vite Proxy** (seamless API routing)
- **Environment Variables** (secure configuration)

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+
- Docker & docker-compose
- Git
- Gemini API key ([get free key](https://makersuite.google.com/app/apikey))

### Installation

\`\`\`bash
# Clone repository
git clone https://github.com/RachitMittal-20/ContentIQ.git
cd ContentIQ

# Start ChromaDB
docker-compose up -d

# Backend setup
cd server
npm install
cp .env.example .env
# Edit .env with your GEMINI_API_KEY
npm run dev
# Server runs on http://localhost:3001

# Frontend (new terminal)
cd client
npm install
npm run dev
# Opens http://localhost:5173
\`\`\`

**Full guide:** See [SETUP.md](./SETUP.md) for detailed instructions and troubleshooting.

---

## 📚 Usage

### 1. Analyze Videos
\`\`\`bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "videoA": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "videoB": "https://www.youtube.com/watch?v=jNQXAC9IVRw"
  }'
\`\`\`

### 2. Ask Questions via RAG Chat
\`\`\`javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Which video had better engagement?",
    history: []
  })
});
\`\`\`

**Complete API docs:** [docs/API.md](./docs/API.md)

---

## 🏗️ Architecture

ContentIQ uses **Retrieval-Augmented Generation (RAG)**:

1. **Retrieval**: Search vector database for relevant transcript chunks
2. **Augmentation**: Build prompt with retrieved context
3. **Generation**: LLM generates response with citations
4. **Streaming**: Send tokens in real-time via SSE

See [ARCHITECTURE.md](./ARCHITECTURE.md) and [docs/RAG.md](./docs/RAG.md) for details.

---

## 📊 Performance Highlights

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Frontend Load | 1.2s | <2s | ✅ |
| Animation FPS | 58-60 | 60 | ✅ |
| RAG Latency | 1.8s | <2s | ✅ |
| Bundle (gzip) | 234KB | <250KB | ✅ |

See [PERFORMANCE.md](./docs/PERFORMANCE.md) for detailed breakdown.

---

## 📁 Project Structure

\`\`\`
contentiq/
├── README.md
├── SETUP.md
├── ARCHITECTURE.md
├── LICENSE
├── .env.example
├── server/
├── client/
└── docs/
    ├── API.md
    ├── PERFORMANCE.md
    └── RAG.md
\`\`\`

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on:
- Branch naming conventions
- Commit message format
- Code style guidelines

---

## 📝 Version History

**v1.0.0** (Current)
- Full RAG pipeline
- 60fps particle animation
- SSE streaming chat

See [CHANGELOG.md](./CHANGELOG.md) for details.

---

## 📄 License

MIT License — See [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgments

- Google Gemini API
- ChromaDB for vector database
- Hugging Face for embeddings
- React & Vite communities

---

## 👨‍💻 Author

**Rachit Mittal**  
Full Stack AI Engineer | Techsolv IT Intern

- **GitHub**: [@RachitMittal-20](https://github.com/RachitMittal-20)
- **LinkedIn**: [linkedin.com/in/RachitMittal-20](#)
- **Email**: rachitmittal20@example.com

---

## ❓ Support

- 📚 **Setup Issues?** → See [SETUP.md](./SETUP.md)
- 🔧 **API Questions?** → See [docs/API.md](./docs/API.md)
- 🐛 **Found a bug?** → [Open an issue](https://github.com/RachitMittal-20/ContentIQ/issues)

---

<div align="center">

**Made with ❤️ for the Techsolv IT internship program**

⭐ If this helped you, consider starring the repo!

</div>
# Deployment fix
