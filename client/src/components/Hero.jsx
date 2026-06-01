import React, { useEffect, useMemo, useRef, useState } from 'react';
import useParticles from '../hooks/useParticles.js';
import { smoothScrollTo, smoothScrollToElement } from '../utils/smoothScroll.js';

const tags = [
  { title: 'CONTENT IQ', sub: 'Creator Intelligence Platform.' },
  { title: 'DATA-BACKED INSIGHTS', sub: 'For every upload you make.' },
  { title: "YOU CAN'T GROW", sub: "What you can't understand." },
  { title: 'RAG-POWERED CHAT', sub: 'ChromaDB · Groq · MiniLM' },
];

export default function Hero({ bootOut, navActive, setNavActive, onScrollToAnalyze }) {
  const canvasRef = useRef(null);
  const [tagIdx, setTagIdx] = useState(0);

  // Mount particles only after loader completes (bootOut).
  useParticles({ canvasRef, enabled: bootOut });

  useEffect(() => {
    if (!bootOut) return;
    const t = setInterval(() => setTagIdx((i) => i + 1), 3800);
    return () => clearInterval(t);
  }, [bootOut]);

  const activeTag = tags[((tagIdx % tags.length) + tags.length) % tags.length];

  const scrollToTop = () => smoothScrollTo(0);
  const scrollToHow = () => smoothScrollToElement(document.getElementById('how'), { offset: -40 });

  const goPrev = () => setTagIdx((i) => i - 1);
  const goNext = () => setTagIdx((i) => i + 1);

  return (
    <section id="hero">
      <canvas id="particleCanvas" ref={canvasRef} />
      <div className="hero-horizon" />

      <div className="tagbox" id="tagbox">
        <button className="tagbox-arrow" id="tagPrev" type="button" onClick={goPrev}>
          &#8249;
        </button>
        <div className="tagbox-text">
          <div className="tagbox-title" id="tagTitle" style={{ opacity: 1 }}>
            {activeTag.title}
          </div>
          <div className="tagbox-sub" id="tagSub" style={{ opacity: 1 }}>
            {activeTag.sub}
          </div>
        </div>
        <button className="tagbox-arrow" id="tagNext" type="button" onClick={goNext}>
          &#8250;
        </button>
      </div>

      <div className="hero-bottom">
        <div className="hero-logo">
          Content<span>IQ</span>
        </div>
        <nav className="hero-nav">
          <div
            className={navActive === 'start' ? 'hn-item act' : 'hn-item'}
            onClick={() => {
              setNavActive('start');
              scrollToTop();
            }}
          >
            Start
          </div>
          <div
            className={navActive === 'how' ? 'hn-item act' : 'hn-item'}
            onClick={() => {
              setNavActive('how');
              scrollToHow();
            }}
          >
            How it Works
          </div>
          <div
            className={navActive === 'analyze' ? 'hn-item act' : 'hn-item'}
            onClick={() => {
              setNavActive('analyze');
              onScrollToAnalyze();
            }}
          >
            Analyze
          </div>
        </nav>

        <div className="scroll-hint">
          <div className="scroll-arr" />
          <span>Scroll</span>
        </div>
      </div>
    </section>
  );
}

