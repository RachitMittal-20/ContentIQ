import React, { useEffect, useMemo, useState } from 'react';
import VideoCard from '../components/VideoCard.jsx';
import ChatPanel from '../components/ChatPanel.jsx';

const formatNumber = (n) => {
  const num = Number(n);
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat('en-US').format(num);
};

export default function Dashboard() {
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('https://snowshoe-seventeen-worsening.ngrok-free.dev/api/metadata', {
          headers: { 'ngrok-skip-browser-warning': '1' },
        });
        const data = await res.json();
        if (!mounted) return;
        if (!data.success) throw new Error(data.error || 'Failed to load metadata');
        setMetadata({ A: data.metadataA, B: data.metadataB });
      } catch (err) {
        console.error('[ContentIQ] metadata fetch error:', err);
        if (!mounted) return;
        setError(err?.message || 'Failed to load metadata');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const viewProps = useMemo(() => {
    if (!metadata) return null;
    return {
      A: metadata.A,
      B: metadata.B,
    };
  }, [metadata]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-500">Dashboard</h1>
          <p className="text-iq-secondaryText mt-1">
            Side-by-side performance + RAG chat with citations.
          </p>
        </header>

        {error && <div className="text-iq-danger">{error}</div>}

        <section
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          aria-label="Video metadata"
        >
          {viewProps ? (
            <>
              <VideoCard
                variant="A"
                formatNumber={formatNumber}
                metadata={viewProps.A}
              />
              <VideoCard
                variant="B"
                formatNumber={formatNumber}
                metadata={viewProps.B}
              />
            </>
          ) : (
            <div className="md:col-span-2 text-iq-secondaryText">Loading metadata...</div>
          )}
        </section>

        <div className="mt-6">
          <ChatPanel metadata={viewProps} />
        </div>
      </div>
    </div>
  );
}

