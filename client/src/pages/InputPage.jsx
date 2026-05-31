import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressSteps from '../components/ProgressSteps.jsx';

const StepState = {
  PENDING: 'pending',
  DONE: 'done',
  ACTIVE: 'active',
};

export default function InputPage() {
  const navigate = useNavigate();

  const [videoAUrl, setVideoAUrl] = useState('');
  const [videoBUrl, setVideoBUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const steps = useMemo(
    () => [
      'Fetching transcripts & metadata',
      'Computing engagement rates',
      'Chunking & embedding transcripts',
      'Storing in vector database',
      'Ready to chat',
    ],
    [],
  );

  const [stepStates, setStepStates] = useState(() => steps.map(() => StepState.PENDING));

  function markStepDone(idx) {
    setStepStates((prev) => {
      const next = [...prev];
      next[idx] = StepState.DONE;
      if (idx + 1 < next.length) next[idx + 1] = StepState.ACTIVE;
      return next;
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!videoAUrl.trim() || !videoBUrl.trim()) {
      setError('Both Video A URL and Video B URL are required.');
      return;
    }

    setIsAnalyzing(true);
    setStepStates(() => {
      const init = steps.map(() => StepState.PENDING);
      init[0] = StepState.ACTIVE;
      return init;
    });

    try {
      const res = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoA: videoAUrl, videoB: videoBUrl }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Analysis failed');

      markStepDone(0);
      markStepDone(1);
      markStepDone(2);
      markStepDone(3);
      markStepDone(4);

      navigate('/dashboard');
    } catch (err) {
      console.error('[ContentIQ] analyze failed:', err);
      setError(err?.message || 'Failed to analyze videos');
      setIsAnalyzing(false);
      setStepStates(steps.map(() => StepState.PENDING));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <header className="mb-6">
          <h1 className="text-3xl font-500">ContentIQ</h1>
          <p className="text-iq-secondaryText mt-2">
            Compare two videos and ask an AI analyst why one outperformed the other.
          </p>
        </header>

        <div className="bg-iq-surface border border-iq-border rounded-2xl p-6">
          <ProgressSteps steps={steps} stepStates={stepStates} />

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-iq-secondaryText">YouTube URL</label>
              <input
                className="mt-2 w-full bg-transparent border border-iq-border rounded-xl px-4 py-3 outline-none focus:border-purple-400"
                type="url"
                value={videoAUrl}
                onChange={(e) => setVideoAUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={isAnalyzing}
                required
              />
            </div>

            <div>
              <label className="text-sm text-iq-secondaryText">Instagram Reels URL</label>
              <input
                className="mt-2 w-full bg-transparent border border-iq-border rounded-xl px-4 py-3 outline-none focus:border-purple-400"
                type="url"
                value={videoBUrl}
                onChange={(e) => setVideoBUrl(e.target.value)}
                placeholder="https://www.instagram.com/reel/..."
                disabled={isAnalyzing}
                required
              />
            </div>

            {error && <div className="text-iq-danger text-sm">{error}</div>}

            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full mt-2 bg-iq-purple text-iq-text rounded-xl px-5 py-3 font-500 disabled:opacity-60"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Videos'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

