import React from 'react';

const engagementTone = (rate) => {
  const r = Number(rate);
  if (Number.isNaN(r)) return { color: 'text-iq-secondaryText', bg: 'bg-transparent' };
  if (r > 5) return { color: 'text-iq-success', bg: 'bg-iq-success/10' };
  if (r >= 2) return { color: 'text-iq-warning', bg: 'bg-iq-warning/10' };
  return { color: 'text-iq-danger', bg: 'bg-iq-danger/10' };
};

export default function VideoCard({ variant, metadata, formatNumber }) {
  const m = metadata || {};
  const rate = m.engagementRate;
  const tone = engagementTone(rate);

  const videoId = m.videoId;
  const youtubeThumb = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null;

  return (
    <div className="bg-iq-surface border border-iq-border rounded-2xl overflow-hidden">
      <div className="p-4 flex gap-4">
        <div className="w-40 h-24 rounded-xl overflow-hidden border border-iq-border bg-black/20">
          {youtubeThumb ? (
            <img className="w-full h-full object-cover" src={youtubeThumb} alt="thumbnail" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-iq-secondaryText text-sm">
              {variant} thumbnail
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-500 text-iq-text truncate">{m.title || `Video ${variant}`}</h3>
            <span className="text-xs px-2 py-1 rounded-full border border-iq-border text-iq-secondaryText">
              {variant}
            </span>
          </div>

          <div className="text-sm text-iq-secondaryText mt-1">{m.creatorName || '—'}</div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-iq-secondaryText">Views</div>
              <div className="font-500">{formatNumber(m.views)}</div>
            </div>
            <div>
              <div className="text-iq-secondaryText">Likes</div>
              <div className="font-500">{formatNumber(m.likes)}</div>
            </div>
            <div>
              <div className="text-iq-secondaryText">Comments</div>
              <div className="font-500">{formatNumber(m.comments)}</div>
            </div>
          </div>

          <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-xl border border-iq-border ${tone.bg} ${tone.color}`}>
            <span className="text-sm font-500">Engagement</span>
            <span className="text-sm font-500">{typeof rate === 'number' ? `${rate.toFixed(2)}%` : '—'}</span>
          </div>

          <div className="text-sm text-iq-secondaryText mt-3 space-y-1">
            <div>
              Upload date: <span className="text-iq-text">{m.uploadDate || '—'}</span>
            </div>
            <div>
              Duration: <span className="text-iq-text">{m.duration || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="text-sm text-iq-secondaryText">Top hashtags</div>
        <div className="flex flex-wrap gap-2 mt-2">
          {(m.topHashtags || []).slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 rounded-full border border-iq-border text-iq-secondaryText"
            >
              #{tag}
            </span>
          ))}
          {(!m.topHashtags || m.topHashtags.length === 0) && (
            <span className="text-xs text-iq-secondaryText">—</span>
          )}
        </div>
      </div>
    </div>
  );
}

