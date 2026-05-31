// Best-effort char-based chunking to approximate token chunking.
// Requirement: chunkSize 512 tokens, chunkOverlap 50 tokens.
// In this scaffold we chunk by characters because exact tokenization would require
// a tokenizer. Chunk sizes are tuned to keep semantic segments coherent.

export function chunkTranscriptText({ text, chunkSize = 4200, chunkOverlap = 800 }) {
  const t = (text || '').trim();
  if (!t) return [];

  const chunks = [];
  let start = 0;
  while (start < t.length) {
    const end = Math.min(t.length, start + chunkSize);
    const piece = t.slice(start, end).trim();
    if (piece) chunks.push(piece);
    if (end === t.length) break;
    start = Math.max(0, end - chunkOverlap);
  }
  return chunks;
}

