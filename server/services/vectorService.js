import { ChromaClient } from 'chromadb';
import { pipeline } from '@xenova/transformers';
import dotenv from 'dotenv';
dotenv.config();

const CHROMA_URL = process.env.CHROMA_URL || 'http://localhost:8000';
const chroma = new ChromaClient({ path: CHROMA_URL });

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

export async function storeVideoChunks({ collectionName, videoId, sourceUrl, chunks, metadataExtras = {} }) {
  const collection = await chroma.getOrCreateCollection({ name: collectionName });
  const ids = chunks.map((_, idx) => `${videoId}-${idx}`);
  const metadatas = chunks.map((_, idx) => ({
    video_id: videoId,
    chunk_index: idx,
    source_url: sourceUrl,
    ...metadataExtras,
  }));
  const embeddings = await generateEmbeddings(chunks);
  if (chunks.length) {
    await collection.upsert({ ids, documents: chunks, embeddings, metadatas });
  }
  console.log(`[ContentIQ] Stored ${chunks.length} chunks in ${collectionName}`);
  return { chunkCount: chunks.length };
}

export async function queryVideoChunks({ collectionName, query, nResults = 2 }) {
  try {
    const collection = await chroma.getCollection({ name: collectionName });
    const queryEmbeddings = await generateEmbeddings([query]);
    const results = await collection.query({ queryEmbeddings, nResults });
    return {
      documents: results?.documents?.[0] || [],
      metadatas: results?.metadatas?.[0] || [],
    };
  } catch (err) {
    console.error(`[ContentIQ] Query failed for ${collectionName}:`, err.message);
    return { documents: [], metadatas: [] };
  }
}
