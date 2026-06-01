# Contributing to ContentIQ

Thank you for your interest in contributing to ContentIQ! This document provides guidelines and instructions for contributing.

---

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others when possible
- Report issues professionally

---

## Getting Started

### 1. Fork the Repository

Click **Fork** on the GitHub repo page.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/ContentIQ.git
cd ContentIQ
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/RachitMittal-20/ContentIQ.git
```

### 4. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**
- `feature/xyz` — New feature
- `fix/xyz` — Bug fix
- `docs/xyz` — Documentation
- `perf/xyz` — Performance improvement
- `refactor/xyz` — Code refactor

---

## Development Workflow

### Setup Local Environment

```bash
# Install dependencies
npm install
npm --prefix server install
npm --prefix client install

# Start services
docker-compose up -d        # ChromaDB
npm run dev                 # Frontend + Backend
```

### Make Your Changes

Edit files in `server/` or `client/` directories.

### Test Your Changes

```bash
# Frontend
cd client
npm run build  # Check for build errors

# Backend
cd server
npm run dev    # Check console for errors
```

### Commit Your Changes

Use clear, descriptive commit messages:

```bash
git commit -m "feat: add user authentication to chat endpoints"
git commit -m "fix: handle missing YouTube transcripts gracefully"
git commit -m "docs: update RAG pipeline explanation"
git commit -m "perf: optimize particle system rendering"
git commit -m "refactor: extract embedding logic into separate module"
```

**Commit format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `perf` — Performance improvement
- `refactor` — Code refactor
- `test` — Test updates
- `chore` — Build, dependencies

**Example:**
```
feat(rag): add streaming token citations

Implement citation markers [[1]], [[2]] in streamed responses.
Users can now click citations to see source chunks.

Fixes #42
```

### Push Your Branch

```bash
git push origin feature/your-feature-name
```

### Create a Pull Request

1. Go to your fork on GitHub
2. Click **New Pull Request**
3. Select `main` branch as target
4. Fill in PR template:
   - **Title:** Clear description
   - **Description:** What and why
   - **Related Issues:** Link to issues
   - **Screenshots:** If UI changes

**PR Title Examples:**
- `feat: add real-time collaboration features`
- `fix: handle edge case in vector embedding`
- `docs: improve SETUP.md with troubleshooting`

---

## Code Style Guidelines

### JavaScript/React

**Naming:**
```javascript
// ✅ Good
const userPreferences = { ... };
function calculateEngagementRate() { ... }
const MAX_RETRIES = 3;

// ❌ Bad
const up = { ... };
function calc() { ... }
const max_retries = 3;
```

**Functions:**
```javascript
// ✅ Use async/await
async function fetchAnalysis() {
  try {
    const data = await api.analyze(...);
    return data;
  } catch (err) {
    console.error('Analysis failed:', err);
    throw err;
  }
}

// ❌ Avoid old-style promises
api.analyze().then(...).catch(...);
```

**React Components:**
```javascript
// ✅ Functional components with hooks
function AnalyzeForm({ onSubmit }) {
  const [videoA, setVideoA] = useState('');
  
  return <form onSubmit={onSubmit}>{...}</form>;
}

// ❌ Avoid class components
class AnalyzeForm extends React.Component { ... }
```

**Error Handling:**
```javascript
// ✅ Explicit error messages
if (!videoUrl) {
  throw new Error('Video URL is required');
}

// ❌ Silent failures
if (!videoUrl) return;
```

### Documentation

```javascript
// ✅ Good - clear purpose and params
/**
 * Chunk transcript text into overlapping segments
 * @param {string} text - Full transcript
 * @param {number} chunkSize - Tokens per chunk (default 512)
 * @param {number} overlap - Token overlap between chunks (default 50)
 * @returns {Array<{text, index}>} Array of chunks
 */
export function chunkTranscriptText({ text, chunkSize = 512, overlap = 50 }) {
  ...
}

// ❌ Unclear - no documentation
export function chunk(t) {
  ...
}
```

### Indentation & Formatting

```javascript
// Use 2 spaces (never tabs)
if (condition) {
  doSomething();
}

// Use const/let (never var)
const value = 42;
let counter = 0;

// Use template literals
const message = `Hello, ${name}!`;  // ✅
const message = "Hello, " + name + "!";  // ❌

// Arrow functions for callbacks
array.map(item => item.value);  // ✅
array.map(function(item) { ... });  // ❌
```

---

## Testing

### Unit Tests (if applicable)

```bash
npm test
```

If adding new functionality, include tests:

```javascript
// Example: test/services/chromadb.test.js
describe('ChromaDB Service', () => {
  it('should store and retrieve embeddings', async () => {
    const stored = await storeVideoChunks({
      collectionName: 'test',
      chunks: [{ text: 'test' }]
    });
    
    expect(stored.success).toBe(true);
  });
});
```

### Manual Testing

1. **Backend:** Test with cURL
```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"videoA":"...", "videoB":"..."}'
```

2. **Frontend:** Test in browser
- Check console for errors
- Test on mobile (DevTools)
- Verify all flows work

---

## Documentation Updates

### When to Update Docs

- ✅ New features → update README + API docs
- ✅ Bug fixes → add troubleshooting note if relevant
- ✅ API changes → update API.md immediately
- ✅ New tech added → add to architecture docs

### Where to Document

```
ContentIQ/
├── README.md          # Project overview, quick start
├── SETUP.md           # Step-by-step setup
├── ARCHITECTURE.md    # System design
├── docs/
│   ├── API.md         # Endpoint reference
│   ├── PERFORMANCE.md # Optimization details
│   └── RAG.md         # RAG implementation
└── CONTRIBUTING.md    # This file
```

---

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Changes are well-tested
- [ ] Commit messages are clear
- [ ] Documentation is updated
- [ ] No console.log left in production code
- [ ] No hardcoded API keys/URLs

### During Review

- [ ] Respond to feedback promptly
- [ ] Be open to suggestions
- [ ] Request re-review after changes
- [ ] Keep PR focused (one feature per PR)

### After Approval

- [ ] Maintainer merges to main
- [ ] Celebrate! 🎉

---

## Reporting Issues

### Bug Reports

Include:
- **OS:** Windows / Mac / Linux
- **Node version:** `node --version`
- **Steps to reproduce:** Clear, numbered steps
- **Expected behavior:** What should happen
- **Actual behavior:** What's happening
- **Error message:** Full stack trace
- **Screenshots:** If relevant

**Example:**
```
# Bug: Chat doesn't stream responses

## Steps
1. Open http://localhost:5173
2. Analyze two videos
3. Ask a question in chat
4. Wait

## Expected
Tokens should stream token-by-token

## Actual
Page shows blank response for 2s, then all text at once

## Environment
- OS: macOS 14.1
- Node: v18.17.0
- Browser: Chrome 120
```

### Feature Requests

Include:
- **Use case:** Why do you need this?
- **Proposed solution:** How should it work?
- **Alternatives:** Other approaches?

**Example:**
```
# Feature: Save analyses to history

## Use Case
Users want to compare analyses from previous sessions

## Proposed Solution
Add a "History" page showing past analyses with timestamps

## Alternatives
- Implement local storage only (no backend)
- Add browser extension for history
```

---

## Development Tools

### Useful Commands

```bash
# Root
npm run dev              # Start both frontend + backend
npm run build           # Build frontend

# Server
cd server
npm run dev             # Start with hot-reload
npm start              # Start (production)

# Client
cd client
npm run dev            # Dev server with HMR
npm run build          # Production build
npm run preview        # Preview build locally
```

### Recommended VSCode Extensions

- ESLint
- Prettier
- Thunder Client (for API testing)
- MongoDB for MongoDB interactions (if using)

---

## Performance Considerations

### When Optimizing

- Measure before and after (use DevTools)
- Don't over-optimize too early
- Add comments explaining why optimization exists
- Include metrics in commit message

### Benchmarking

```javascript
// Example: measure RAG latency
console.time('rag-query');
const results = await queryVideoChunks({ ... });
console.timeEnd('rag-query');
```

---

## Licensing

By contributing, you agree that your contributions will be licensed under the MIT License (see LICENSE file).

---

## Questions?

- Open an issue for questions
- Start a discussion for ideas
- Check existing issues before asking

---

## Recognition

Contributors will be acknowledged in:
- CHANGELOG.md
- GitHub contributors page
- README.md (for major contributions)

Thank you for contributing to ContentIQ! 🚀
