import { useState, useRef, useCallback } from 'react';
import initialLayout from '../data/initialLayout.json';
import { sendChatMessage } from '../utils/api';

export function useLayoutAgent() {
  const [layout, setLayout] = useState(initialLayout);
  const [previousLayout, setPreviousLayout] = useState(null);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your layout agent. Describe a change and I'll update the design instantly.",
    },
  ]);

  const llmHistory = useRef([]);

  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return;

    if (text.trim().toLowerCase() === 'reset' || text.toLowerCase().includes('reset to original')) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: text },
        { role: 'assistant', content: 'Layout has been reset to the original design.' },
      ]);
      setPreviousLayout(layout);
      setLayout(initialLayout);
      llmHistory.current = [];
      return;
    }

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const trimmedHistory = llmHistory.current.slice(-6);
      const result = await sendChatMessage({ message: text, layout, history: trimmedHistory });

      setPreviousLayout(layout);
      setLayout(result.updatedLayout);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: result.explanation },
      ]);

      llmHistory.current = [
        ...llmHistory.current,
        { role: 'user', content: text },
        { role: 'assistant', content: result.explanation },
      ];
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        (err.message.includes('Network')
          ? 'Cannot reach the server. Is it running on port 3001?'
          : 'Something went wrong. Please try again.');

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠ ${msg}`, isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  }, [layout, loading]);

  const undo = useCallback(() => {
    if (!previousLayout) return;
    setLayout(previousLayout);
    setPreviousLayout(null);
    llmHistory.current = llmHistory.current.slice(0, -2);
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: 'Undid the last change.' },
    ]);
  }, [previousLayout]);

  return { layout, messages, loading, canUndo: !!previousLayout, sendMessage, undo };
}