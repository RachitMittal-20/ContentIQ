import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Loader from './components/Loader.jsx';
import Hero from './components/Hero.jsx';
import Insight from './components/Insight.jsx';
import Analyze from './components/Analyze.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import ProcessingFlow from './components/ProcessingFlow.jsx';
import Dashboard from './components/Dashboard.jsx';
import Chat from './components/Chat.jsx';
import Footer from './components/Footer.jsx';
import { smoothScrollToElement } from './utils/smoothScroll.js';

function useDocumentBodyLock(locked) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

export default function App() {
  const [bootProgress, setBootProgress] = useState(0);
  const [bootOut, setBootOut] = useState(false);
  const particlesMountedRef = useRef(false);
  const constMountedRef = useRef(false);

  const location = useLocation();

  const isBooting = !bootOut;
  useDocumentBodyLock(isBooting);

  // Show loader first; once completed, mount animated canvases.
  const onBootComplete = useMemo(() => {
    return () => {
      setBootOut(true);
      // actual mounting is handled by dedicated components via props
    };
  }, []);

  // When leaving the landing route, stop animations via unmount.
  // On re-enter, they mount fresh.

  // Routes:
  // - "/" renders landing + scroll sections + chat + dashboard that appear after analyze.
  // - "/dashboard" still works for existing flow; we render the same landing but auto-show dashboard.

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Landing
            bootOut={bootOut}
            bootProgress={bootProgress}
            setBootProgress={setBootProgress}
            onBootComplete={onBootComplete}
            particlesMountedRef={particlesMountedRef}
            constMountedRef={constMountedRef}
            locationKey={location.key}
          />
        }
      />
      <Route
        path="/dashboard"
        element={
          <Landing
            bootOut={bootOut}
            bootProgress={bootProgress}
            setBootProgress={setBootProgress}
            onBootComplete={onBootComplete}
            particlesMountedRef={particlesMountedRef}
            constMountedRef={constMountedRef}
            locationKey={location.key}
            forceShowDashboard
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function Landing({
  bootOut,
  bootProgress,
  setBootProgress,
  onBootComplete,
  particlesMountedRef,
  constMountedRef,
  locationKey,
  forceShowDashboard,
}) {
  const [analysisMeta, setAnalysisMeta] = useState(null);
  const [showProcessing, setShowProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [processingDone, setProcessingDone] = useState(false);

  const [dashboardVisible, setDashboardVisible] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);

  const [chatState, setChatState] = useState({
    loadedCollectionsText: '2 collections loaded',
    // Chat component keeps its own messages; we just pass metadata.
  });

  const [navActive, setNavActive] = useState('start');

  // boot loader progress
  useEffect(() => {
    if (bootOut) return;
    let p = 0;

    const bar = document.getElementById('ldBar');
    const num = document.getElementById('ldNum');

    const t = setInterval(() => {
      p += Math.random() * 18 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(t);
      }
      const next = Math.floor(p);
      setBootProgress(next);
      if (bar) bar.style.width = p + '%';
      if (num) num.textContent = next + '%';

      if (p === 100) {
        setTimeout(() => {
          onBootComplete();
        }, 250);
      }
    }, 50);

    return () => clearInterval(t);
  }, [bootOut, onBootComplete, setBootProgress, locationKey]);

  // Load existing metadata on mount (exact endpoint logic)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/metadata`);
        const d = await r.json();
        if (!mounted) return;
        if (d.success && d.metadataA && d.metadataB) {
          setAnalysisMeta({ A: d.metadataA, B: d.metadataB });
          setDashboardVisible(true);
          setChatVisible(true);
          setChatState((s) => ({ ...s, loadedCollectionsText: '2 collections loaded' }));
        }
      } catch {
        // swallow
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // If user lands directly on /dashboard, force show UI
  useEffect(() => {
    if (!forceShowDashboard) return;
    if (analysisMeta) {
      setDashboardVisible(true);
      setChatVisible(true);
      return;
    }
    // If metadata not yet loaded, the metadata fetch useEffect will handle it.
    // Keep route consistent.
  }, [forceShowDashboard, analysisMeta]);

  // Processing flow helpers
  const startProcessing = () => {
    setShowProcessing(true);
    setProcessingDone(false);
    setProcessingStep(0);
  };

  const stopProcessing = () => {
    setProcessingDone(true);
    setShowProcessing(true);
  };

  // Drive step activation sequentially like the HTML (900ms advance)
  useEffect(() => {
    if (!showProcessing) return;
    if (processingDone) return;

    const nodes = 5;
    let idx = 0;
    const t = setInterval(() => {
      idx++;
      setProcessingStep((prev) => Math.min(nodes - 1, idx));
      if (idx >= nodes - 1) {
        clearInterval(t);
      }
    }, 900);

    return () => clearInterval(t);
  }, [showProcessing, processingDone]);

  const apiAnalyze = async (videoA, videoB) => {
    // Must keep exact request body/endpoint.
    const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoA, videoB }),
    });
    const d = await r.json();
    if (!d.success) throw new Error(d.error || 'Analysis failed');
    return d;
  };

  return (
    <div>
      <Loader bootOut={bootOut} bootProgress={bootProgress} />

      <div className="grain" />

      <Hero
        bootOut={bootOut}
        navActive={navActive}
        setNavActive={setNavActive}
        onScrollToAnalyze={() => {
          smoothScrollToElement(document.getElementById('analyze-section'), { offset: -80 });
        }}
      />

      <Insight />
      <Analyze
        disabled={!bootOut}
        onAnalyze={async (videoA, videoB) => {
          startProcessing();
          try {
            const d = await apiAnalyze(videoA, videoB);
            stopProcessing();
            // Hide processing a bit like HTML (600ms before renderDash)
            setTimeout(() => {
              setShowProcessing(false);
              setAnalysisMeta({ A: d.metadataA, B: d.metadataB });
              setDashboardVisible(true);
              setChatVisible(true);
              setTimeout(() => {
                smoothScrollToElement(document.getElementById('dashboard'), { offset: -40 });
              }, 0);
            }, 600);
          } catch (err) {
            stopProcessing();
            throw err;
          }
        }}
      />

      <HowItWorks bootOut={bootOut} particlesReady={bootOut} constReady={bootOut} />

      {showProcessing && <ProcessingFlow step={processingStep} done={processingDone} />}

      {dashboardVisible && (
        <Dashboard metadata={analysisMeta} onShown={() => {}} />
      )}

      {chatVisible && <Chat metadata={analysisMeta} loadedCollectionsText={chatState.loadedCollectionsText} />}

      <Footer />
    </div>
  );
}

