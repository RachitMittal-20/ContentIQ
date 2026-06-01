import React from 'react';

export default function ProcessingFlow({ step, done }) {
  const nodes = [
    { id: 'fn0', icon: '📥', label: 'Fetching', sub: 'Transcript + metadata' },
    { id: 'fn1', icon: '✂️', label: 'Chunking', sub: '512-token segments' },
    { id: 'fn2', icon: '🔢', label: 'Embedding', sub: 'MiniLM local model' },
    { id: 'fn3', icon: '🗄️', label: 'ChromaDB', sub: 'Upserting collections' },
    { id: 'fn4', icon: '⚡', label: 'Groq Ready', sub: 'llama-3.1-8b online' },
  ];

  return (
    <div id="processing" className="show" style={{ background: 'var(--bg2)' }}>
      <div className="proc-head">
        <p className="proc-title">Processing your videos…</p>
        <p className="proc-sub">Fetching transcripts, embedding chunks, and loading ChromaDB</p>
      </div>
      <div className="flow-grid" id="flowGrid">
        {nodes.map((n, i) => {
          const isActive = !done ? i === step : false;
          const isDone = done || i < step;
          const cls = 'flow-node ' + (isActive ? 'active' : isDone ? 'done' : '');
          return (
            <div key={n.id} className={cls} id={n.id}>
              <div className="node-icon">{n.icon}</div>
              <div className="node-label">{n.label}</div>
              <div className="node-sub">{n.sub}</div>
              <div className="node-check">✅</div>
              <div className="node-bar" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

