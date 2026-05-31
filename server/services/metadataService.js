import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

function extractYoutubeVideoId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
    const v = u.searchParams.get('v');
    if (v) return v;
    const parts = u.pathname.split('/').filter(Boolean);
    const shortsIdx = parts.indexOf('shorts');
    if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];
  } catch {}
  return null;
}

function parseDuration(iso8601) {
  try {
    const m = String(iso8601 || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!m) return null;
    const h = Number(m[1] || 0);
    const min = Number(m[2] || 0);
    const s = Number(m[3] || 0);
    const total = h * 3600 + min * 60 + s;
    if (h > 0) return `${h}:${String(min).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${min}:${String(s).padStart(2,'0')}`;
  } catch { return null; }
}

export async function getYoutubeMetadata(url) {
  const videoId = extractYoutubeVideoId(url);
  if (!videoId) throw new Error('Unable to extract YouTube videoId');

  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,statistics,contentDetails&key=${YOUTUBE_API_KEY}`;
  const res = await axios.get(apiUrl, { timeout: 10000 });
  const item = res.data?.items?.[0];
  if (!item) throw new Error('Video not found');

  const snippet = item.snippet || {};
  const stats = item.statistics || {};
  const content = item.contentDetails || {};

  const views = Number(stats.viewCount || 0);
  const likes = Number(stats.likeCount || 0);
  const comments = Number(stats.commentCount || 0);
  const engagementRate = views > 0 ? Math.round(((likes + comments) / views) * 10000) / 100 : null;

  const tags = snippet.tags || [];
  const topHashtags = tags.slice(0, 3).map(t => t.toLowerCase().replace(/\s+/g, ''));

  return {
    videoId,
    title: snippet.title || 'Unknown Title',
    creatorName: snippet.channelTitle || 'Unknown',
    views,
    likes,
    comments,
    engagementRate,
    uploadDate: snippet.publishedAt ? snippet.publishedAt.slice(0, 10) : null,
    duration: parseDuration(content.duration),
    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    topHashtags,
    sourceType: 'youtube',
  };
}
