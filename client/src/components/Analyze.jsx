import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export default function Analyze({ disabled, onAnalyze }) {
  const [videoA, setVideoA] = useState('');
  const [videoB, setVideoB] = useState('');
  const [statusType, setStatusType] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [btnText, setBtnText] = useState('⚡ Analyze & Compare');
  const [isBusy, setIsBusy] = useState(false);

  const statusTimerRef = useRef(null);

  const setStatus = (type, msg) => {
    setStatusType(type);
    setStatusMsg(msg);
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    if (type === 'ok') {
      statusTimerRef.current = setTimeout(() => {
        setStatusType(null);
        setStatusMsg('');
      }, 4000);
    }
  };

  const runAnalysis = useCallback(async () => {
    const a = videoA.trim();
    const b = videoB.trim();
    if (!a || !b) {
      setStatus('error', 'Please enter both video URLs first.');
      return;
    }

    setIsBusy(true);
    setBtnText('⏳ Analyzing…');
    setStatus('loading', 'Connecting to backend…');

    try {
      await onAnalyze(a, b);
      setStatus('ok', '✓ Analysis complete — Groq + ChromaDB ready.');
      setTimeout(() => {
        setStatusType(null);
        setStatusMsg('');
      }, 4000);
      setBtnText('⚡ Re-Analyze');
    } catch (err) {
      setStatus('error', '✗ ' + (err?.message || 'Server unavailable. Is it running?'));
      setBtnText('⚡ Retry Analysis');
    } finally {
      setIsBusy(false);
    }
  }, [onAnalyze, videoA, videoB]);

  // Set up scroll observers + connector animation exactly like HTML
  useEffect(() => {
    const srObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            srObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    document.querySelectorAll('.sr').forEach((el) => srObs.observe(el));

    const insObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('in');
        });
      },
      { threshold: 0.2 },
    );
    const aEl = document.getElementById('insightText');
    if (aEl) insObs.observe(aEl);

    const aObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('in');
        });
      },
      { threshold: 0.15 },
    );
    const intro = document.getElementById('analyzeIntro');
    const card = document.getElementById('inputCard');
    if (intro) aObs.observe(intro);
    if (card) aObs.observe(card);

    const connObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          el.classList.add('in');
          setTimeout(() => el.classList.add('dashed'), 1050);
          connObs.unobserve(el);
        });
      },
      { threshold: 0.6 },
    );

    document.querySelectorAll('.sec-conn').forEach((el) => connObs.observe(el));

    return () => {
      srObs.disconnect();
      insObs.disconnect();
      aObs.disconnect();
      connObs.disconnect();
    };
  }, []);

  return (
    <section id="analyze-section" style={{ background: 'var(--bg2)' }}>
      <div className="analyze-wrap" style={{ margin: '0 auto' }}>
        <div className="analyze-intro" id="analyzeIntro">
          <div className="sec-pill">Analyze Now</div>
          <div className="sec-conn" id="conn-analyze">
            <div className="sc-fill" />
            <div className="sc-dash" />
            <div className="sc-dot" />
            <div className="sc-end" />
          </div>
          <h2 className="analyze-head">Drop two video URLs.<br />Let the AI do the rest.</h2>
          <p className="analyze-desc">
            Paste two YouTube video URLs to compare transcripts, engagement, and performance with RAG-powered AI.
          </p>
        </div>

        <div className="input-card" id="inputCard">
          <div className="inputs-row">
            <div className="inp-grp">
              <label className="inp-label" htmlFor="vidA">
                <span className="tag-badge a">A</span> Video A URL
              </label>
              <input
                id="vidA"
                className="url-inp"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                autoComplete="off"
                spellCheck={false}
                value={videoA}
                onChange={(e) => setVideoA(e.target.value)}
                disabled={disabled || isBusy}
              />
            </div>
            <div className="inp-grp">
              <label className="inp-label" htmlFor="vidB">
                <span className="tag-badge b">B</span> Video B URL
              </label>
              <input
                id="vidB"
                className="url-inp"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                autoComplete="off"
                spellCheck={false}
                value={videoB}
                onChange={(e) => setVideoB(e.target.value)}
                disabled={disabled || isBusy}
              />
            </div>
          </div>

          <button className="go-btn" id="goBtn" onClick={runAnalysis} disabled={disabled || isBusy}>
            {btnText}
          </button>

          <div
            className={
              'status ' + (statusType ? 'show ' + statusType : '')
            }
            id="statusBar"
            style={statusType ? undefined : { display: 'none' }}
          >
            <div className="spin" id="statusSpin" style={{ display: statusType === 'loading' ? 'block' : 'none' }} />
            <span id="statusMsg">{statusMsg}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

