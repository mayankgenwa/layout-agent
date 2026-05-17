import { useState } from 'react';

const SUGGESTIONS = [
  'Convert this design to 9:16',
  'Move the headline to the top',
  'Make the headline smaller',
  'Keep the product large',
  'Move the offer badge higher',
  'Make the discount badge bigger',
  'Change the headline color to red',
  'Center the product',
  'Reset to original layout',
];

export default function ChatInput({ onSend, loading }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim() || loading) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <div className="chat-input-area">
      <div className="suggestions">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            className="chip"
            onClick={() => { onSend(s); }}
            disabled={loading}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="input-row">
        <textarea
          className="chat-textarea"
          placeholder="e.g. Convert to 9:16 and keep the product large…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={2}
          disabled={loading}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={loading || !text.trim()}
        >
          {loading ? '⏳' : '↑'}
        </button>
      </div>
    </div>
  );
}
