import { useCallback, useMemo, useRef, useState } from 'react';

function toGeminiHistory(history) {
  // history is [{role, content}]
  return history.map((m) => ({ role: m.role, content: m.content }));
}

export default function useChat({ metadata }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const historyRef = useRef([]);

  const reset = useCallback(() => {
    setMessages([]);
    setInput('');
    historyRef.current = [];
    setIsStreaming(false);
  }, []);

  const appendTokenToLastAssistant = useCallback((token) => {
    setMessages((prev) => {
      const next = [...prev];
      const lastIdx = next.length - 1;
      if (lastIdx >= 0 && next[lastIdx].role === 'assistant') {
        next[lastIdx] = { ...next[lastIdx], content: next[lastIdx].content + token };
      }
      return next;
    });
  }, []);

  const sendMessage = useCallback(
    async (messageText) => {
      const text = (messageText ?? input).trim();
      if (!text) return;

      setInput('');
      setErrorState(null);

      const userMsg = { role: 'user', content: text };
      setMessages((prev) => [...prev, userMsg]);
      historyRef.current = [...historyRef.current, userMsg];

      // Placeholder assistant message
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
      setIsStreaming(true);

      try {
        const res = await fetch('https://snowshoe-seventeen-worsening.ngrok-free.dev/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': '1' },
          body: JSON.stringify({
            message: text,
            history: toGeminiHistory(historyRef.current),
            metadata,
          }),
        });

        if (!res.ok) throw new Error('Chat request failed');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunkText = decoder.decode(value, { stream: true });
          const lines = chunkText
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.startsWith('data:'));

          for (const line of lines) {
            const data = JSON.parse(line.slice(5));
            if (data.done) {
              setIsStreaming(false);
              // commit assistant message to history
              setMessages((prev) => {
                const next = [...prev];
                const assistantIdx = next.length - 1;
                const assistant = next[assistantIdx];
                historyRef.current = [...historyRef.current, assistant];
                return next;
              });
              return;
            }
            if (data.token) appendTokenToLastAssistant(data.token);
          }
        }
      } catch (err) {
        console.error('[ContentIQ] chat stream error:', err);
        setIsStreaming(false);
      }
    },
    [appendTokenToLastAssistant, input, metadata],
  );

  const [errorState, setErrorState] = useState(null);

  return {
    messages,
    input,
    setInput,
    isStreaming,
    sendMessage,
    appendToken: appendTokenToLastAssistant,
    reset,
    errorState,
  };
}

