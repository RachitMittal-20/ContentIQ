// In this screening project we keep /api/analyze as a single request.
// The frontend step indicator is therefore optimistic (lights up once analyze returns).
// A production version would stream progress via SSE or WebSockets.

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

