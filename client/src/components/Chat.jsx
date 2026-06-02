import React, { useCallback, useEffect, useRef, useState } from 'react';
import { smoothScrollContainer } from '../utils/smoothScroll.js';

const SUGGESTED_PROMPTS = [
  { label: 'Why did A outperform B?', prompt: 'Why did Video A get more engagement than Video B? Analyse the difference.' },
  { label: 'Compare the hooks', prompt: 'Compare the hooks in the first 5 seconds of each video. Which one grabs attention better and why?' },
  { label: 'Improve Video B', prompt: 'Suggest specific improvements for Video B based on what worked in Video A.' },
  { label: 'Engagement breakdown', prompt: 'What is the engagement rate of each video and what drove those numbers?' },
  { label: 'Creator & content style', prompt: 'Who are the creators of these videos and how do their content styles differ?' },
];

export default function Chat({ metadata, loadedCollectionsText }) {
  const messagesRef = useRef(null);
  const textareaRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [messages, setMessages] = useState([]);
  const chatHistoryRef = useRef([]);

  const formatCits = useCallback(
    (t) => t.replace(/\[Source: (Video [AB], chunk \d+)\]/g, '<span class="cit">$1</span>'),
    [],
  );

  // Reset chat whenever metadata (new analysis) changes
  useEffect(() => {
    chatHistoryRef.current = [];
    setStreaming(false);
    setMessages([]);
  }, [metadata]);

  // Scroll to bottom when messages update
  useEffect(() => {
    const m = messagesRef.current;
    if (m) smoothScrollContainer(m, m.scrollHeight);
  }, [messages]);

  const sendMsg = useCallback(
    async (msgText) => {
      if (streaming) return;
      const textarea = textareaRef.current;
      const msg = (msgText != null ? String(msgText) : (textarea?.value ?? '')).trim();
      if (!msg) return;

      if (textarea) {
        textarea.value = '';
        textarea.style.height = 'auto';
        textarea.focus();
      }

      setStreaming(true);
      chatHistoryRef.current.push({ role: 'user', content: msg });
      setMessages((prev) => [...prev, { role: 'user', html: msg, id: Date.now() }]);

      const botId = Date.now() + 1;
      setMessages((prev) => [...prev, { role: 'bot', html: null, id: botId }]);

      let full = '';
      try {
        const r = await fetch(`https://contentiq-sm0f.onrender.com/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': '1' },
          body: JSON.stringify({
            message: msg,
            history: chatHistoryRef.current.slice(-10).map((m) => ({ role: m.role, content: m.content })),
            metadata,
          }),
        });
        if (!r.ok) throw new Error('Chat request failed');

        const reader = r.body.getReader();
        const dec = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = dec.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            try {
              const p = JSON.parse(line.slice(6));
              if (p.done) break;
              if (p.token) {
                full += p.token;
                setMessages((prev) =>
                  prev.map((m) => (m.id === botId ? { ...m, html: full } : m)),
                );
              }
            } catch { /* ignore malformed SSE */ }
          }
        }

        chatHistoryRef.current.push({ role: 'assistant', content: full });
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) => (m.id === botId ? { ...m, html: '⚠ ' + (err?.message || 'Something went wrong.'), error: true } : m)),
        );
      } finally {
        setStreaming(false);
      }
    },
    [formatCits, metadata, streaming],
  );

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMsg();
    }
  };

  const autoH = (el) => {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 110) + 'px';
  };

  if (!metadata) return null;

  const isEmpty = messages.length === 0;

  return (
    <div id="chatWrap" style={{ display: 'block' }}>
      <div className="chat-wrap">
        <div className="chat-top">
          <div className="alive-dot" />
          <div className="chat-top-title">RAG Chat — Ask About Your Videos</div>
          <div className="chat-pill">{loadedCollectionsText}</div>
        </div>

        <div className="messages" ref={messagesRef}>
          {isEmpty ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <div className="empty-txt">
                Analysis complete. Ask anything about these two videos — performance, transcripts, hooks, or strategy.
              </div>
              <div className="chips">
                {SUGGESTED_PROMPTS.map(({ label, prompt }) => (
                  <button
                    key={label}
                    className="chip"
                    type="button"
                    onClick={() => sendMsg(prompt)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={'msg ' + (msg.role === 'user' ? 'user' : 'bot')}>
                <div className="avatar">{msg.role === 'user' ? '👤' : '🤖'}</div>
                <div className="bubble">
                  {msg.html == null ? (
                    <div className="typing">
                      <div className="td" />
                      <div className="td" />
                      <div className="td" />
                    </div>
                  ) : (
                    <span dangerouslySetInnerHTML={{ __html: formatCits(msg.html) }} />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="chat-footer">
          <textarea
            ref={textareaRef}
            className="chat-inp"
            placeholder="Ask about these videos… (Enter to send)"
            rows="1"
            onKeyDown={onKeyDown}
            onInput={(e) => autoH(e.target)}
            disabled={streaming}
          />
          <button
            className="send-btn"
            type="button"
            onClick={() => sendMsg()}
            disabled={streaming}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
