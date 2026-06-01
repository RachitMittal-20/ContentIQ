import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import { youtubeTranscript, fetchInstagramMetadata } from './transcriptService.js';
import { getYoutubeMetadata } from './metadataService.js';
import { storeVideoChunks, queryVideoChunks } from './vectorService.js';
import { chunkTranscriptText } from '../utils/chunker.js';
import { sessionStore } from '../store.js';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function computeEngagementRate({ views, likes, comments }) {
  const v = Number(views);
  if (!v || Number.isNaN(v) || v <= 0) return null;
  const numerator = (Number.isNaN(Number(likes)) ? 0 : Number(likes)) +
    (Number.isNaN(Number(comments)) ? 0 : Number(comments));
  return Math.round((numerator / v) * 10000) / 100;
}

function safeJoinTranscript(transcript) {
  if (Array.isArray(transcript)) return transcript.join('\n');
  if (transcript && typeof transcript.join === 'function') return transcript.join('\n');
  return transcript || null;
}

export async function handleAnalyze({ videoA, videoB }) {
  console.log('[ContentIQ] Fetching transcripts...');
  const transcriptA = await youtubeTranscript(videoA).catch(() => null);
  const transcriptB = await youtubeTranscript(videoB).catch(() => null);

  const safeTranscriptA = safeJoinTranscript(transcriptA) || 'No transcript available.';
  const safeTranscriptB = safeJoinTranscript(transcriptB) || 'No transcript available.';

  console.log('[ContentIQ] Fetching metadata...');
  const metadataA = await getYoutubeMetadata(videoA).catch(() => null);
  const metadataB = await getYoutubeMetadata(videoB).catch(async () => fetchInstagramMetadata(videoB)).catch(() => null);

  const metaA = metadataA || { videoId: null, title: 'Video A', creatorName: 'Unknown', views: 0, likes: 0, comments: 0, uploadDate: null, duration: null, topHashtags: [], sourceType: 'youtube' };
  const metaB = metadataB || { videoId: null, title: 'Video B', creatorName: 'Unknown', views: 0, likes: 0, comments: 0, uploadDate: null, duration: null, topHashtags: [], sourceType: 'instagram', instagramMock: true };

  metaA.engagementRate = computeEngagementRate(metaA);
  metaB.engagementRate = computeEngagementRate(metaB);

  console.log('[ContentIQ] Chunking & embedding transcripts...');
  const chunksA = chunkTranscriptText({ text: safeTranscriptA });
  const chunksB = chunkTranscriptText({ text: safeTranscriptB });

  try {
    await storeVideoChunks({ collectionName: 'video_a_chunks', videoId: 'A', sourceUrl: videoA, chunks: chunksA, metadataExtras: { title: metaA.title, creatorName: metaA.creatorName } });
    await storeVideoChunks({ collectionName: 'video_b_chunks', videoId: 'B', sourceUrl: videoB, chunks: chunksB, metadataExtras: { title: metaB.title, creatorName: metaB.creatorName } });
  } catch (err) {
    console.error('[ContentIQ] Chroma store failed:', err);
    throw new Error('ChromaDB unreachable.');
  }

  const thumbUrl = (meta) => meta.thumbnail || (meta.videoId ? `https://img.youtube.com/vi/${meta.videoId}/hqdefault.jpg` : null);

  const metadataPayloadA = { videoId: metaA.videoId, title: metaA.title, creatorName: metaA.creatorName, views: metaA.views, likes: metaA.likes, comments: metaA.comments, engagementRate: metaA.engagementRate, uploadDate: metaA.uploadDate, duration: metaA.duration, topHashtags: metaA.topHashtags || [], sourceType: metaA.sourceType, thumbnail: thumbUrl(metaA) };
  const metadataPayloadB = { videoId: metaB.videoId, title: metaB.title, creatorName: metaB.creatorName, views: metaB.views, likes: metaB.likes, comments: metaB.comments, engagementRate: metaB.engagementRate, uploadDate: metaB.uploadDate, duration: metaB.duration, topHashtags: metaB.topHashtags || [], sourceType: metaB.sourceType, instagramMock: metaB.instagramMock || false, thumbnail: thumbUrl(metaB) };

  sessionStore.metadataByVideoId = { A: metadataPayloadA, B: metadataPayloadB };
  sessionStore.lastRunAt = new Date().toISOString();

  console.log('[ContentIQ] Analyze complete. Ready to chat.');
  return { success: true, metadataA: metadataPayloadA, metadataB: metadataPayloadB };
}

export async function handleChatStream({ res, message, history = [], metadata }) {
  const metadataA = metadata?.A || { title: 'Video A', creatorName: 'Unknown', engagementRate: 0 };
  const metadataB = metadata?.B || { title: 'Video B', creatorName: 'Unknown', engagementRate: 0 };

  const [resultsA, resultsB] = await Promise.all([
    queryVideoChunks({ collectionName: 'video_a_chunks', query: message, nResults: 1 }),
    queryVideoChunks({ collectionName: 'video_b_chunks', query: message, nResults: 1 }),
  ]);

  const contextChunks = [];
  const pack = (results, label) => {
    (results?.documents || []).forEach((docText, idx) => {
      const chunkIndex = results?.metadatas?.[idx]?.chunk_index ?? idx;
      contextChunks.push(`[Source: Video ${label}, chunk ${chunkIndex}] ${docText}`);
    });
  };
  pack(resultsA, 'A');
  pack(resultsB, 'B');

  const context = contextChunks.join('\n\n');
  const systemPrompt = `You are ContentIQ, an AI analyst helping content creators understand video performance.

You have access to transcripts and metadata from two videos:
- Video A: ${metadataA.title} by ${metadataA.creatorName} — Engagement Rate: ${metadataA.engagementRate ?? 0}%
- Video B: ${metadataB.title} by ${metadataB.creatorName} — Engagement Rate: ${metadataB.engagementRate ?? 0}%

When answering:
1. Always cite which video and chunk you're drawing from: [Source: Video A, chunk N]
2. Be specific — reference actual transcript content, not generalizations
3. When comparing, always mention the engagement rate difference
4. Suggest improvements based on data, not opinion
5. Keep responses concise but insightful

Context from transcripts:
${context}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.filter(Boolean).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message }
  ];

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stream = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages,
    stream: true,
    temperature: 0.4,
    max_tokens: 512,
  });

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content || '';
    if (token) {
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    }
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
}
