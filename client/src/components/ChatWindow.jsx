import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ messages, loading }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="chat-window">
      {messages.map((msg, i) => (
        <MessageBubble key={i} message={msg} />
      ))}
      {loading && (
        <div className="message assistant">
          <div className="bubble bubble-assistant loading-bubble">
            <span className="dot" /><span className="dot" /><span className="dot" />
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
