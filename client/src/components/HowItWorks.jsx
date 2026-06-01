import React, { useEffect, useRef } from 'react';
import useConstellation from '../hooks/useConstellation.js';

export default function HowItWorks({ bootOut }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useConstellation({ enabled: bootOut, canvasRef });

  return (
    <section id="how">
      <div className="sec-pill sr">How it Works</div>
      <div className="sec-conn" id="conn-how">
        <div className="sc-fill" />
        <div className="sc-dash" />
        <div className="sc-dot" />
        <div className="sc-end" />
      </div>
      <h2 className="how-title sr">How ContentIQ Works</h2>
      <p className="how-sub sr">From raw URLs to AI-powered answers — the full RAG pipeline behind the scenes.</p>

      <div className="const-wrap sr" ref={wrapRef}>
        <canvas id="constCanvas" ref={canvasRef} />

        <div className="cn" style={{ left: '50%', top: '10%' }} id="cn0">
          <div className="cn-body">
            <div className="cn-icon">🔗</div>
            <div className="cn-lbl">YouTube<br />Input</div>
          </div>
          <div className="cn-plus">+</div>
        </div>

        <div className="cn" style={{ left: '84%', top: '33%' }} id="cn1">
          <div className="cn-body">
            <div className="cn-icon">📊</div>
            <div className="cn-lbl">Data API<br />v3</div>
          </div>
          <div className="cn-plus">+</div>
        </div>

        <div className="cn" style={{ left: '74%', top: '84%' }} id="cn2">
          <div className="cn-body">
            <div className="cn-icon">📝</div>
            <div className="cn-lbl">Transcript<br />Extract</div>
          </div>
          <div className="cn-plus">+</div>
        </div>

        <div className="cn" style={{ left: '26%', top: '84%' }} id="cn3">
          <div className="cn-body">
            <div className="cn-icon">🗄️</div>
            <div className="cn-lbl">ChromaDB<br />Vector DB</div>
          </div>
          <div className="cn-plus">+</div>
        </div>

        <div className="cn" style={{ left: '16%', top: '33%' }} id="cn4">
          <div className="cn-body">
            <div className="cn-icon">💬</div>
            <div className="cn-lbl">AI<br />Analyst</div>
          </div>
          <div className="cn-plus">+</div>
        </div>

        <div className="cn cn-hub" style={{ left: '50%', top: '58%' }} id="cn5">
          <div className="cn-body">
            <div className="cn-icon">🧠</div>
            <div className="cn-lbl">RAG<br />Pipeline</div>
          </div>
          <div className="cn-plus">+</div>
        </div>
      </div>
    </section>
  );
}

