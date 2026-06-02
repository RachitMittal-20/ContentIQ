import dotenv from 'dotenv';
dotenv.config();

// Pure in-memory store — intentionally resets on each server restart / new analyze call.
const store = new Map();

async function generateEmbeddings(texts) {
  const res = await fetch('https://api.groq.com/openai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'nomic-embed-text-v1_5', input: texts }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq embeddings error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  // API returns items in order but spec says sort by index to be safe
  return data.data.sort((a, b) => a.index - b.index).map(d => d.embedding);
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
  const embeddings = chunks.length ? await generateEmbeddings(chunks) : [];

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

    const [queryEmbedding] = await generateEmbeddings([query]);

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
