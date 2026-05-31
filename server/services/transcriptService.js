import axios from 'axios';
import * as cheerio from 'cheerio';
import { fetchTranscript as ytTranscript } from 'youtube-transcript';

function normalizeError(err) {
  const msg = err?.message || String(err);
  return msg;
}

export async function youtubeTranscript(url) {
  // youtube-transcript supports YouTube URLs/IDs.
  const transcript = await ytTranscript(url);
  return transcript?.map((t) => t.text).filter(Boolean);
}

export async function fetchInstagramMetadata(url) {
  // Requirement: attempt axios+cheerio scraping, but fallback gracefully on blocks.
  try {
    const res = await axios.get(url, { timeout: 8000 });
    const $ = cheerio.load(res.data);

    const title = $('meta[property="og:title"]').attr('content') || 'Instagram Reel';
    const creatorName = $('meta[property="og:description"]').attr('content')?.split('—')[0]?.trim() || 'Unknown';

    // Engagement fields are usually not present in HTML without JS; keep safe defaults.
    return {
      videoId: null,
      title,
      creatorName,
      views: 0,
      likes: 0,
      comments: 0,
      uploadDate: null,
      duration: null,
      topHashtags: [],
      sourceType: 'instagram',
      instagramMock: false,
      scrapingNotes: 'Best-effort HTML scrape (JS-rendered fields may be missing).',
    };
  } catch (err) {
    // Documented limitation in README: instagram blocks most environments.
    console.warn('[ContentIQ] Instagram metadata scrape failed (fallback to mock):', normalizeError(err));

    return {
      videoId: null,
      title: 'Instagram Reel (mock metadata)',
      creatorName: 'Unknown',
      views: 0,
      likes: 0,
      comments: 0,
      uploadDate: null,
      duration: null,
      topHashtags: [],
      sourceType: 'instagram',
      instagramMock: true,
      scrapingNotes: 'Instagram blocked scraping; use Apify or RapidAPI in production.',
    };
  }
}

