import { pipeline } from '@xenova/transformers';

let embedder = null;
async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
}

async function generateEmbeddings(texts) {
  const embed = await getEmbedder();
  const results = [];
  for (const text of texts) {
    const output = await embed(text, { pooling: 'mean', normalize: true });
    results.push(Array.from(output.data));
  }
  return results;
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

// In-memory store: collectionName -> { ids, documents, embeddings, metadatas }
const store = new Map();

export async function storeVideoChunks({ collectionName, videoId, sourceUrl, chunks, metadataExtras = {} }) {
  const ids = chunks.map((_, idx) => `${videoId}-${idx}`);
  const metadatas = chunks.map((_, idx) => ({
    video_id: videoId,
    chunk_index: idx,
    source_url: sourceUrl,
    ...metadataExtras,
  }));

  const embeddings = chunks.length ? await generateEmbeddings(chunks) : [];

  // Upsert: replace any existing entries with same id
  const existing = store.get(collectionName) || { ids: [], documents: [], embeddings: [], metadatas: [] };
  const idMap = new Map(existing.ids.map((id, i) => [id, i]));

  for (let i = 0; i < ids.length; i++) {
    const idx = idMap.get(ids[i]);
    if (idx !== undefined) {
      existing.documents[idx] = chunks[i];
      existing.embeddings[idx] = embeddings[i];
      existing.metadatas[idx] = metadatas[i];
    } else {
      existing.ids.push(ids[i]);
      existing.documents.push(chunks[i]);
      existing.embeddings.push(embeddings[i]);
      existing.metadatas.push(metadatas[i]);
    }
  }

  store.set(collectionName, existing);
  console.log(`[ContentIQ] Stored ${chunks.length} chunks in ${collectionName} (in-memory)`);
  return { chunkCount: chunks.length };
}

export async function queryVideoChunks({ collectionName, query, nResults = 2 }) {
  try {
    const collection = store.get(collectionName);
    if (!collection || !collection.embeddings.length) return { documents: [], metadatas: [] };

    const [queryEmbedding] = await generateEmbeddings([query]);

    const scored = collection.embeddings.map((emb, i) => ({
      score: cosineSimilarity(queryEmbedding, emb),
      document: collection.documents[i],
      metadata: collection.metadatas[i],
    }));

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, nResults);

    return {
      documents: top.map((r) => r.document),
      metadatas: top.map((r) => r.metadata),
    };
  } catch (err) {
    console.error(`[ContentIQ] Query failed for ${collectionName}:`, err.message);
    return { documents: [], metadatas: [] };
  }
}
