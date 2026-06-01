# ContentIQ Setup Guide

Complete step-by-step instructions to get ContentIQ running on your local machine.

## 📋 Prerequisites

Before you start, make sure you have:

- **Node.js** 18.0 or higher ([Download](https://nodejs.org/))
- **Docker** & **docker-compose** ([Download](https://www.docker.com/products/docker-desktop))
- **Git** ([Download](https://git-scm.com/))
- **Text Editor**: VS Code recommended ([Download](https://code.visualstudio.com/))
- **API Keys**:
  - Gemini API key (free tier available): [Get key](https://makersuite.google.com/app/apikey)
  - YouTube Data API key (optional, for better metadata): [Get key](https://developers.google.com/youtube/registering_an_application)

---

## 🚀 Step 1: Clone the Repository

```bash
git clone https://github.com/RachitMittal-20/ContentIQ.git
cd ContentIQ
```

Verify you're in the right directory:
```bash
pwd  # Should show: /path/to/ContentIQ
ls   # Should show: server, client, docker-compose.yml, README.md, etc.
```

---

## 🔑 Step 2: Set Up Environment Variables

### Backend (.env)

```bash
cd server
cp ../.env.example .env
```

Edit `server/.env` in your text editor:

```bash
# Open with VS Code or your editor
code .env
```

Fill in your actual values:

```env
GEMINI_API_KEY=sk_YOUR_ACTUAL_KEY_HERE
YOUTUBE_API_KEY=YOUR_YOUTUBE_API_KEY_HERE (optional)
PORT=3001
NODE_ENV=development
CHROMA_URL=http://localhost:8000
```

**How to get Gemini API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key and paste into `.env`

### Frontend (.env)

```bash
cd ../client
cp ../.env.example .env
```

Frontend `.env` should contain:
```env
VITE_API_URL=http://localhost:3001
```

---

## 🐳 Step 3: Start ChromaDB (Vector Database)

Return to project root:

```bash
cd ..
```

Start Docker container:

```bash
docker-compose up -d
```

Verify ChromaDB is running:

```bash
docker-compose ps
# Should show chromadb container with "Up" status

# Check health
curl http://localhost:8000/api/v1/heartbeat
# Should return 200 OK
```

**Troubleshooting:**
- If Docker not running: Open Docker Desktop app
- If port 8000 in use: `lsof -i :8000` then `kill -9 <PID>`
- If `docker-compose` not found: Reinstall Docker Desktop

---

## 📦 Step 4: Install Backend Dependencies

```bash
cd server
npm install
```

Wait for npm to finish (may take 2-3 minutes).

Verify installation:
```bash
npm list
# Should show all dependencies installed
```

---

## 🚀 Step 5: Start Backend Server

**In the same `server/` terminal:**

```bash
npm run dev
```

You should see:
```
[nodemon] starting node index.js
[ContentIQ] Server listening on port 3001
[ContentIQ] ChromaDB connected at http://localhost:8000
```

**Keep this terminal open.** The backend is now running on `http://localhost:3001`.

---

## 🎨 Step 6: Install Frontend Dependencies (NEW TERMINAL)

Open a **new terminal window/tab** (don't close the backend terminal):

```bash
cd /path/to/ContentIQ/client
npm install
```

Wait for installation to complete.

---

## 🌐 Step 7: Start Frontend Dev Server

**In the frontend terminal:**

```bash
npm run dev
```

You should see:
```
VITE v5.x.x ready in XXX ms

➜ Local: http://localhost:5173/
➜ press h + enter to show help
```

---

## ✅ Step 8: Verify Everything Works

### In your browser:

1. Open `http://localhost:5173`
2. You should see:
   - ✅ ContentIQ loading screen with progress bar
   - ✅ Particle animation hero section ("ContentIQ" spelled in particles)
   - ✅ Bottom navigation bar
   - ✅ URL input fields

### Test the full flow:

1. **Scroll down** to the "Analyze Now" section
2. **Paste 2 YouTube URLs**:
   - Video A: https://www.youtube.com/watch?v=dQw4w9WgXcQ
   - Video B: https://www.youtube.com/watch?v=jNQXAC9IVRw
3. **Click "⚡ Analyze & Compare"**
4. **Wait 30-60 seconds** for analysis to complete
5. **See the dashboard** with video metrics (views, likes, comments, engagement)
6. **Try the RAG chat**: Ask "Which video had better engagement?"
7. **See streaming response** with citations

---

## 🛠 Troubleshooting

### Issue: Port 3001 already in use

```bash
# Find process using port
lsof -i :3001

# Kill it
kill -9 <PID>

# Or use a different port in .env
PORT=3002
```

### Issue: ChromaDB connection error

```bash
# Restart ChromaDB
docker-compose down
docker-compose up -d

# Verify
curl http://localhost:8000/api/v1/heartbeat
```

### Issue: "Cannot find module" errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue: Gemini API key not working

```bash
# Verify key in .env
cat .env | grep GEMINI

# Try generating a new key
# https://makersuite.google.com/app/apikey
```

### Issue: Vite cannot find API proxy

```bash
# Check vite.config.js has proxy configured
cat vite.config.js

# Should have:
# proxy: {
#   '/api': 'http://localhost:3001'
# }
```

---

## 🎬 Step 9: (Optional) Run Tests

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd ../client
npm test
```

---

## 🚢 Next Steps

### Run in Production Mode

```bash
# Backend
cd server
npm run build
npm start

# Frontend (new terminal)
cd client
npm run build
npm preview
```

### Deploy to Render & Vercel

See [README.md](../README.md) for deployment instructions.

---

## 📞 Getting Help

If you're stuck:

1. **Check the logs** in both terminals for error messages
2. **Verify all prerequisites** are installed (Node 18+, Docker running)
3. **Check .env files** are properly filled
4. **Restart everything**:
   ```bash
   # Kill all processes
   killall node
   docker-compose down
   
   # Start fresh
   docker-compose up -d
   npm run dev (in both terminals)
   ```
5. **Open an issue** on GitHub with error messages

---

## ✨ You're Done!

ContentIQ is now running locally. Explore the UI, test the RAG chat, and enjoy! 🎉
