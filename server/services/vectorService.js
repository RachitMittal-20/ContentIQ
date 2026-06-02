import dotenv from 'dotenv';
dotenv.config();

// Pure in-memory store — intentionally resets on each server restart / new analyze call.
const store = new Map();

function generateLocalEmbedding(text) {
  const vec = new Array(384).fill(0);
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    vec[i % 384] += code * (i + 1);
  }
  const mag = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map(v => v / mag);
}

function generateEmbeddings(texts) {
  return texts.map(generateLocalEmbedding);
}

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function storeVideoChunks({ collectionName, videoId, sourceUrl, chunks, metadataExtras = {} }) {
  const embeddings = chunks.length ? generateEmbeddings(chunks) : [];

  const metadatas = chunks.map((_, idx) => ({
    video_id: videoId,
    chunk_index: idx,
    source_url: sourceUrl,
    ...metadataExtras,
  }));

  // Replace entire collection on every analyze run
  store.set(collectionName, { documents: chunks, embeddings, metadatas });

  console.log(`[ContentIQ] Stored ${chunks.length} chunks in ${collectionName}`);
  return { chunkCount: chunks.length };
}

export async function queryVideoChunks({ collectionName, query, nResults = 2 }) {
  try {
    const collection = store.get(collectionName);
    if (!collection || !collection.embeddings.length) return { documents: [], metadatas: [] };

    const [queryEmbedding] = generateEmbeddings([query]);

    const scored = collection.embeddings.map((emb, i) => ({
      score: cosineSimilarity(queryEmbedding, emb),
      document: collection.documents[i],
      metadata: collection.metadatas[i],
    }));

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, nResults);

    return {
      documents: top.map(r => r.document),
      metadatas: top.map(r => r.metadata),
    };
  } catch (err) {
    console.error(`[ContentIQ] Query failed for ${collectionName}:`, err.message);
    return { documents: [], metadatas: [] };
  }
}
