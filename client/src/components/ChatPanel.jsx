import React, { useEffect, useMemo } from 'react';
import SuggestedChips from './SuggestedChips.jsx';
import useChat from '../hooks/useChat.js';

export default function ChatPanel({ metadata }) {
  const suggestedQuestions = useMemo(
    () => [
      'Why did Video A get more engagement than Video B?',
      "What's the engagement rate of each video?",
      'Compare the hooks in the first 5 seconds',
      "Who's the creator of Video B?",
      'Suggest improvements for B based on what worked in A',
    ],
    [],
  );

  const { messages, input, setInput, isStreaming, sendMessage, reset, errorState } = useChat({
    metadata,
  });

  useEffect(() => {
    // When landing on dashboard, reset any previous session chat state.
    reset();
  }, [reset]);

  return (
    <div className="bg-iq-surface border border-iq-border rounded-2xl p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-500">RAG Analyst</h2>
          <p className="text-iq-secondaryText text-sm">Streamed answers with source citations.</p>
        </div>
        <div className="text-xs text-iq-secondaryText">Session memory enabled</div>
      </div>

      <div className="mt-4">
        <SuggestedChips questions={suggestedQuestions} onPick={sendMessage} />
      </div>

      <div className="mt-4 flex flex-col h-[520px]">
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-3">
            {errorState && <div className="text-iq-danger">{errorState}</div>}

            {messages.length === 0 && <div className="text-iq-secondaryText">Ask a question to begin.</div>}

            {messages.map((m, idx) => (
              <div
                key={`${m.role}-${idx}`}
                className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
              >
                <div
                  className={
                    m.role === 'user'
                      ? 'bg-iq-purple text-iq-text px-4 py-3 rounded-2xl max-w-[80%]'
                      : 'bg-[#0C0C13] border border-iq-border text-iq-text px-4 py-3 rounded-2xl max-w-[80%]'
                  }
                >
                  <pre className="whitespace-pre-wrap text-sm font-400">{m.content}</pre>
                </div>
              </div>
            ))}

            {isStreaming && (
              <div className="flex justify-start">
                <div className="bg-[#0C0C13] border border-iq-border text-iq-text px-4 py-3 rounded-2xl max-w-[80%]">
                  <div className="text-sm text-iq-secondaryText">
                    Thinking<span className="iq-cursor">|</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 border-t border-iq-border pt-3">
          <div className="flex gap-3 sticky bottom-0">
            <input
              className="flex-1 bg-transparent border border-iq-border rounded-xl px-4 py-3 outline-none focus:border-purple-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask why..."
              disabled={isStreaming}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
            />
            <button
              className="bg-iq-purple text-iq-text rounded-xl px-5 py-3 font-500 disabled:opacity-60"
              onClick={() => sendMessage(input)}
              disabled={isStreaming || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

