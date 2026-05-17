export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`message ${isUser ? 'user' : 'assistant'}`}>
      {!isUser && <div className="avatar">🤖</div>}
      <div className={`bubble ${isUser ? 'bubble-user' : 'bubble-assistant'} ${message.isError ? 'bubble-error' : ''}`}>
        {message.content}
      </div>
      {isUser && <div className="avatar">👤</div>}
    </div>
  );
}
