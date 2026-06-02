import React, { useEffect, useState } from 'react';

const fmt = (n) => {
  if (!n || n === '0' || n === 0) return '—';
  const v = parseInt(n, 10);
  if (Number.isNaN(v)) return n;
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K';
  return v.toLocaleString();
};
const fmtEng = (v) => (v == null ? '—' : parseFloat(v).toFixed(2) + '%');
const engPct = (v) => (v ? Math.min(parseFloat(v) * 10, 100) : 0);

export default function Dashboard({ metadata }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!metadata) return;
    setVisible(true);
  }, [metadata]);

  if (!metadata) return null;

  const cards = [
    { cls: 'ca', label: 'Video A', m: metadata.A },
    { cls: 'cb', label: 'Video B', m: metadata.B },
  ];

  return (
    <div id="dashboard" className={visible ? 'show' : ''}>
      <div className="dash-head">
        <p className="dash-title">Comparison Results</p>
        <p className="dash-sub">Side-by-side performance breakdown</p>
      </div>

      <div className="comp-grid" id="compGrid">
        {cards.map(({ cls, label, m }) => {
          const eng = m?.engagementRate ?? m?.engagement_rate;
          const pct = engPct(eng);
          const thumb = m?.thumbnail;

          return (
            <div key={cls} className={'vid-card ' + cls + ' in'} style={{ transitionDelay: '80ms' }}>

              {thumb && (
                <img
                  src={thumb}
                  alt={m?.title || label}
                  style={{ width: '100%', borderRadius: 8, marginBottom: 12, objectFit: 'cover', maxHeight: 180 }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}

              {!thumb && <div className="card-tag-pill" style={{ marginBottom: 14 }}>{label}</div>}

              <div className="card-vtitle">{m?.title || m?.platform || m?.video_id || 'Untitled Video'}</div>

              {m?.creatorName && m.creatorName !== 'Unknown' && (
                <div className="card-creator">by {m.creatorName}
                  {m?.uploadDate && <span className="card-date"> · {m.uploadDate}</span>}
                </div>
              )}

              <div className="stats">
                <div className="stat">
                  <div className="stat-l">Views</div>
                  <div className="stat-v">{fmt(m?.views)}</div>
                </div>
                <div className="stat">
                  <div className="stat-l">Likes</div>
                  <div className="stat-v">{fmt(m?.likes)}</div>
                </div>
                <div className="stat">
                  <div className="stat-l">Comments</div>
                  <div className="stat-v">{fmt(m?.comments ?? m?.comment_count)}</div>
                </div>
                <div className="stat">
                  <div className="stat-l">Engagement</div>
                  <div className={'stat-v ' + (pct > 30 ? 'pos' : '')}>{fmtEng(eng)}</div>
                </div>
              </div>

              <div className="eng-sec">
                <div className="eng-row">
                  <span>Engagement Rate</span>
                  <span>{fmtEng(eng)}</span>
                </div>
                <div className="eng-track">
                  <div className="eng-fill" id={'ef-' + cls} style={{ width: pct + '%' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
