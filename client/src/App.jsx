import { useState } from 'react';
import { useLayoutAgent } from './hooks/useLayoutAgent';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import WireframePreview from './components/WireframePreview';
import JsonViewer from './components/JsonViewer';
import './App.css';

export default function App() {
  const { layout, messages, loading, canUndo, sendMessage, undo } = useLayoutAgent();
  const [rightTab, setRightTab] = useState('preview');
  const [prevLayout, setPrevLayout] = useState(null);

  const handleSend = (text) => {
    setPrevLayout(layout);
    sendMessage(text);
  };

  const artboard = layout?.nodes
    ? Object.values(layout.nodes).find((n) => n.type === 'artboard')
    : null;

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="header-brand">
          <span className="brand-icon">⬡</span>
          <span className="brand-name">Layout Agent</span>
        </div>
        <button className="undo-btn" onClick={undo} disabled={!canUndo}>
          ↩ Undo
        </button>
      </header>

      <div className="app-body">
        <div className="left-panel">
          <div className="panel-label">Chat</div>
          <ChatWindow messages={messages} loading={loading} />
          <ChatInput onSend={handleSend} loading={loading} />
        </div>

        <div className="right-panel">
          <div className="tab-bar">
            <button
              className={`tab-btn ${rightTab === 'preview' ? 'active' : ''}`}
              onClick={() => setRightTab('preview')}
            >
              🖼 Preview
            </button>
            <button
              className={`tab-btn ${rightTab === 'json' ? 'active' : ''}`}
              onClick={() => setRightTab('json')}
            >
              { } JSON
            </button>
          </div>
          <div className="tab-content">
            {rightTab === 'preview'
              ? <WireframePreview layout={layout} />
              : <JsonViewer layout={layout} previousLayout={prevLayout} />
            }
          </div>
        </div>
      </div>
    </div>
  );
}
