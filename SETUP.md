# ContentIQ Setup Guide

A step-by-step guide to get ContentIQ running locally on your machine.

## Prerequisites

Before you start, ensure you have:

- **Node.js** 18.0 or higher ([Download](https://nodejs.org/))
- **Docker** and **docker-compose** ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))
- A **Groq API Key** ([Get one free](https://console.groq.com/keys))
- A **Gemini API Key** ([Get one free](https://makersuite.google.com/app/apikey))

Verify installations:
```bash
node --version    # should be v18.0+
docker --version  # should be 24.0+
```

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/RachitMittal-20/ContentIQ.git
cd ContentIQ
```

---

## Step 2: Get Your API Keys

### Groq API Key
1. Go to [console.groq.com](https://console.groq.com/keys)
2. Sign up or log in with your account
3. Create a new API key
4. Copy the key (starts with `gsk_`)

### Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key

---

## Step 3: Configure Environment Variables

Create a `.env` file in the root directory (or copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```bash
GEMINI_API_KEY=<your-gemini-key>
GROQ_API_KEY=<your-groq-key>
PORT=3001
CHROMA_URL=http://localhost:8000
NODE_ENV=development
```

**Important:** Never commit `.env` to Git. It's in `.gitignore` for security.

---

## Step 4: Start ChromaDB (Vector Database)

Open a terminal and run:

```bash
docker-compose up -d
```

Verify ChromaDB is running:
```bash
curl http://localhost:8000/api/v1/heartbeat
```

You should see: `{}`

**Troubleshooting:**
- If port 8000 is in use: `lsof -i :8000` then `kill -9 <PID>`
- Docker not running? Start Docker Desktop first

---

## Step 5: Install Backend Dependencies

Open a new terminal and run:

```bash
cd server
npm install
```

---

## Step 6: Start the Backend Server

From the `server` directory:

```bash
npm run dev
```

You should see:
```
[ContentIQ] Server listening on port 3001
```

**Verify:** Open http://localhost:3001/health in your browser → `{"ok":true}`

---

## Step 7: Install Frontend Dependencies

Open a **third terminal** and run:

```bash
cd client
npm install
```

---

## Step 8: Start the Frontend Dev Server

From the `client` directory:

```bash
npm run dev
```

You should see:
```
VITE ready in XXX ms

➜ Local: http://localhost:5173/
```

---

## Step 9: Open in Browser

Go to **http://localhost:5173** and you should see:

- ✅ Loading animation (0-100%)
- ✅ Hero section with particle canvas
- ✅ Tagbox cycling through messages
- ✅ Navigation menu at the bottom

---

## Step 10: Test the Full Flow

1. **Scroll down** to the "Analyze Now" section
2. **Paste two YouTube video URLs** (e.g., https://www.youtube.com/watch?v=...)
3. **Click "⚡ Analyze & Compare"**
4. **Wait** for processing (should show: Fetching → Chunking → Embedding → ChromaDB → Groq Ready)
5. **View dashboard** with side-by-side comparison
6. **Ask questions** in the RAG Chat (e.g., "Why did A outperform B?")

---

## Troubleshooting

### Frontend Won't Connect to Backend
- Check backend is running: `curl http://localhost:3001/health`
- Check CORS origin in `server/index.js` includes `http://localhost:5173`
- Try clearing browser cache: Cmd+Shift+Delete

### ChromaDB Connection Error
```
Error: ChromaDB unreachable
```
- Verify Docker is running: `docker ps`
- Verify container is up: `docker-compose ps`
- Restart: `docker-compose restart`
- Check port 8000 is free: `lsof -i :8000`

### Groq/Gemini API Errors
- Verify API keys in `.env` are correct (no extra spaces)
- Check API keys are valid at their respective consoles
- Verify you have API quota remaining

### Port Already in Use
```bash
# Find and kill process on port 3001 or 5173
lsof -i :3001
kill -9 <PID>
```

### Particle Animation Stuttering
- This is normal on first load (fonts loading)
- Refresh once fonts are loaded
- Animation should run at 60fps smooth after that

### No Transcript Found
- Some YouTube videos block transcript extraction
- Try with a different video (e.g., TED talks, educational content)
- Instagram videos are best-effort only

---

## Development Commands

```bash
# Root directory
npm run dev              # Start both frontend + backend concurrently
npm run build           # Build frontend for production

# Server directory
npm run dev             # Start backend with hot-reload (nodemon)
npm start               # Start backend (production)

# Client directory
npm run dev             # Start frontend dev server (Vite)
npm run build           # Build frontend optimized bundle
npm run preview         # Preview production build locally
```

---

## Next Steps

1. ✅ API is running → Test endpoints with cURL
2. 📚 Read [API Documentation](./docs/API.md)
3. 🏗️ Learn the [Architecture](./ARCHITECTURE.md)
4. 🧠 Understand [RAG Pipeline](./docs/RAG.md)
5. 📊 Check [Performance Metrics](./docs/PERFORMANCE.md)

---

## Environment Variables Reference

| Variable | Example | Purpose |
|----------|---------|---------|
| `GEMINI_API_KEY` | `AIzaSyD...` | Google's generative AI (LLM) |
| `GROQ_API_KEY` | `gsk_...` | Fast LLM inference (optional, uses Gemini default) |
| `YOUTUBE_API_KEY` | `AIzaSyD...` | YouTube Data API v3 (optional, for analytics) |
| `PORT` | `3001` | Backend server port |
| `CHROMA_URL` | `http://localhost:8000` | ChromaDB vector DB URL |
| `NODE_ENV` | `development` or `production` | Environment mode |
| `LOG_LEVEL` | `info`, `debug`, `warn`, `error` | Logging verbosity |

---

## Support

If you run into issues:

1. Check the troubleshooting section above
2. Review logs in your terminal for error messages
3. Check GitHub issues: https://github.com/RachitMittal-20/ContentIQ/issues
4. Open a new issue with:
   - OS (Windows/Mac/Linux)
   - Node.js version
   - Error message (full stack trace)
   - Steps to reproduce

---

## Next: Deployment

Ready to deploy? See our deployment guides:
- [Deploy Frontend (Vercel)](./docs/DEPLOYMENT_FRONTEND.md)
- [Deploy Backend (Render)](./docs/DEPLOYMENT_BACKEND.md)
