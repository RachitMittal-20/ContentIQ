# Contributing to ContentIQ

Thank you for your interest in contributing! This document provides guidelines for contributing to the ContentIQ project.

---

## 🎯 Getting Started

### Prerequisites
- Node.js 18.0+
- Docker & docker-compose
- Git
- Familiarity with React, Node.js, and REST APIs

### Development Setup

```bash
# Clone the repository
git clone https://github.com/RachitMittal-20/ContentIQ.git
cd ContentIQ

# Follow the SETUP.md guide to get everything running
cat SETUP.md
```

---

## 🔄 Contribution Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
```

**Branch naming conventions**:
- `feature/` — New features: `feature/rag-citation-links`
- `fix/` — Bug fixes: `fix/embedding-null-error`
- `perf/` — Performance improvements: `perf/reduce-bundle-size`
- `docs/` — Documentation: `docs/api-examples`
- `refactor/` — Code refactoring: `refactor/extract-components`

### 2. Make Your Changes

Follow the code style guidelines (see below) and keep commits focused:

```bash
# Make changes to one feature at a time
git add src/components/NewComponent.jsx
git commit -m "feat: add new component for RAG chat"
```

### 3. Write Meaningful Commit Messages

Use the conventional commit format:

```
<type>(<scope>): <subject>

<body (optional)>

<footer (optional)>
```

**Examples**:
- ✅ `feat(frontend): add streaming chat interface`
- ✅ `fix(backend): handle missing YouTube transcripts gracefully`
- ✅ `perf(particle): remove shadowBlur for 60fps animation`
- ✅ `docs(api): add cURL examples for endpoints`
- ❌ `update` (too vague)
- ❌ `fix bug` (unclear what bug)

**Commit Types**:
- `feat` — New feature
- `fix` — Bug fix
- `perf` — Performance improvement
- `docs` — Documentation
- `refactor` — Code refactoring
- `test` — Adding/updating tests
- `chore` — Build, dependencies, tooling

### 4. Keep Changes Focused

- One feature per commit
- One bug fix per commit
- Separate refactoring from feature changes

### 5. Test Your Changes

```bash
# Run tests locally
cd server && npm test
cd ../client && npm test

# Test the full flow manually
npm run dev  # in both terminal windows
```

### 6. Push to GitHub

```bash
git push origin feature/your-feature-name
```

### 7. Create a Pull Request

On GitHub, create a PR with:
- **Title**: Clear description of changes
- **Description**: Why this change? What does it fix/improve?
- **Related issues**: Link to any related GitHub issues
- **Testing**: How to test the changes

**PR Description Template**:
```markdown
## Description
Brief explanation of what this PR does.

## Motivation
Why is this change needed?

## Changes
- Change 1
- Change 2
- Change 3

## How to Test
1. Step 1
2. Step 2
3. Should see X behavior

## Related Issues
Fixes #123
Related to #456

## Checklist
- [ ] Code follows style guidelines
- [ ] No hardcoded values or API keys
- [ ] Tests pass locally
- [ ] Documentation updated
```

---

## 💻 Code Style Guidelines

### JavaScript/React

**Variables & Functions**:
```javascript
// ✅ Good
const isAnalysisComplete = true;
function fetchTranscript(videoId) { ... }
const MAX_PARTICLES = 3400;

// ❌ Bad
const analysis_complete = true;
function fetch_transcript(videoId) { ... }
const max_particles = 3400;  // Should be UPPER_CASE
```

**Arrow Functions**:
```javascript
// ✅ Good
const processChunks = (chunks) => chunks.map(c => c.text);

// ❌ Bad
const processChunks = chunks => { return chunks.map(c => c.text); };
```

**Async/Await**:
```javascript
// ✅ Good
async function analyzeVideos(urlA, urlB) {
  try {
    const responseA = await fetchTranscript(urlA);
    const responseB = await fetchTranscript(urlB);
    return { responseA, responseB };
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
}

// ❌ Bad
function analyzeVideos(urlA, urlB) {
  return fetchTranscript(urlA)
    .then(a => fetchTranscript(urlB).then(b => ({ a, b })))
    .catch(err => console.log(err));
}
```

### React Components

**Functional Components**:
```javascript
// ✅ Good - Functional component with hooks
const ChatInterface = ({ messages, onSendMessage }) => {
  const [input, setInput] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSendMessage(input);
    setInput('');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button type="submit">Send</button>
    </form>
  );
};

// ❌ Bad - Class component (outdated)
class ChatInterface extends React.Component {
  render() { ... }
}
```

**Props Destructuring**:
```javascript
// ✅ Good
const VideoCard = ({ title, views, engagementRate }) => (
  <div>
    <h3>{title}</h3>
    <p>{views} views</p>
    <p>Engagement: {engagementRate}%</p>
  </div>
);

// ❌ Bad
const VideoCard = (props) => (
  <div>
    <h3>{props.title}</h3>
    <p>{props.views} views</p>
  </div>
);
```

**useEffect Cleanup**:
```javascript
// ✅ Good - Proper cleanup
useEffect(() => {
  const subscription = addEventListener('scroll', handleScroll);
  return () => removeEventListener('scroll', handleScroll);
}, []);

// ❌ Bad - Memory leak
useEffect(() => {
  addEventListener('scroll', handleScroll);
}, []);
```

### Comments

```javascript
// ✅ Good - explains WHY, not WHAT
// Halve spring constant for smoother particle gathering
const springConstant = 0.042;

// ✅ Good - complex logic needs explanation
// Canvas 3-pass rendering:
// Pass 1: Ambient stars (lightweight)
// Pass 2: Glow halos (additive blending)
// Pass 3: Sharp cores (crisp dots)
ctx.globalCompositeOperation = 'lighter';

// ❌ Bad - obvious from code
const x = p.x;  // Set x to p.x
```

### Error Handling

```javascript
// ✅ Good - meaningful error messages
async function getMetadata(videoId) {
  try {
    const metadata = await fetchYouTubeMetadata(videoId);
    if (!metadata) {
      throw new Error(`No metadata found for video: ${videoId}`);
    }
    return metadata;
  } catch (error) {
    console.error(`Failed to fetch metadata for ${videoId}:`, error);
    return null;
  }
}

// ❌ Bad - silent failures
async function getMetadata(videoId) {
  const metadata = await fetchYouTubeMetadata(videoId);
  return metadata;  // What if it fails?
}
```

---

## 🧪 Testing

### Writing Tests

```javascript
// Example: Backend test for /api/analyze
describe('POST /api/analyze', () => {
  it('should analyze two YouTube videos', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .send({
        videoA: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        videoB: 'https://www.youtube.com/watch?v=jNQXAC9IVRw'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.metadataA).toBeDefined();
    expect(response.body.metadataB).toBeDefined();
  });

  it('should reject invalid URLs', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .send({
        videoA: 'not-a-url',
        videoB: 'also-not-a-url'
      });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test api.test.js

# Run with coverage
npm test -- --coverage
```

---

## 📚 Documentation

When adding new features, update relevant docs:

1. **API Changes**: Update `docs/API.md`
2. **Architecture Changes**: Update `ARCHITECTURE.md`
3. **New Features**: Add to `CHANGELOG.md`
4. **Setup Changes**: Update `SETUP.md`

---

## 🐛 Reporting Issues

### Before Opening an Issue

- Check existing issues to avoid duplicates
- Verify the issue with latest code (`main` branch)
- Test in both development and production modes

### Issue Format

```markdown
## Description
Brief description of the issue.

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen?

## Actual Behavior
What actually happens?

## Environment
- OS: macOS/Windows/Linux
- Node version: 18.x
- Browser: Chrome/Firefox

## Screenshots/Logs
Any error messages or screenshots?
```

---

## 🚀 Development Best Practices

### Do's ✅

- ✅ Write clear commit messages
- ✅ Test changes locally before pushing
- ✅ Keep branches focused and short-lived
- ✅ Review your own code before requesting review
- ✅ Keep components small and reusable
- ✅ Document complex logic
- ✅ Use environment variables for configuration
- ✅ Handle errors gracefully

### Don'ts ❌

- ❌ Commit API keys or secrets
- ❌ Leave console.log in production code
- ❌ Mix refactoring with feature changes
- ❌ Make large PRs (keep under 400 lines)
- ❌ Use hardcoded values (use constants)
- ❌ Ignore linting errors
- ❌ Merge your own PRs without review

---

## 🔒 Security Considerations

### Before Committing

- [ ] No API keys in code (use `.env`)
- [ ] No passwords or sensitive data
- [ ] No external secrets in logs
- [ ] Use HTTPS for external APIs
- [ ] Validate user inputs
- [ ] Sanitize data before display

### Example: Secure Code

```javascript
// ✅ Good - Uses environment variable
const apiKey = process.env.GEMINI_API_KEY;

// ❌ Bad - Hardcoded secret
const apiKey = 'sk_live_your_actual_key_here';

// ✅ Good - Input validation
if (typeof videoUrl !== 'string' || !videoUrl.includes('youtube.com')) {
  throw new Error('Invalid YouTube URL');
}

// ❌ Bad - No validation
const transcript = await getTranscript(userInput);
```

---

## 🎓 Learning Resources

- **React**: [React Docs](https://react.dev/)
- **Node.js**: [Node.js Docs](https://nodejs.org/en/docs/)
- **ChromaDB**: [ChromaDB Docs](https://docs.trychroma.com/)
- **Gemini API**: [Google AI Studio](https://makersuite.google.com/)
- **Conventional Commits**: [commitlint](https://www.conventionalcommits.org/)

---

## ❓ Questions?

- **Confused about something?** Open a Discussion on GitHub
- **Found a bug?** Open an Issue with reproduction steps
- **Have an idea?** Open a Discussion to discuss before coding

---

## 📝 Code of Conduct

This project adheres to a Code of Conduct (see `CODE_OF_CONDUCT.md`). All contributors are expected to uphold this code. Please report unacceptable behavior to the maintainers.

---

## 🎉 Thank You!

Your contributions help make ContentIQ better for everyone. Thank you for taking the time to contribute!

---

**Questions?** Feel free to ask in Discussions or open an Issue.  
**Ready to contribute?** Fork the repo and create a PR!
