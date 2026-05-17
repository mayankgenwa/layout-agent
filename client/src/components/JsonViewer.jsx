import { useState, useMemo } from 'react';

const TYPE_ICON = { image: '🖼', text: '📝', shape: '⭕', artboard: '🎨' };

function NodeEntry({ id, node, isChanged }) {
  const [open, setOpen] = useState(false);
  const icon = TYPE_ICON[node.type] || '▪';
  const label = node.data?.content
    ? `"${node.data.content.slice(0, 28).replace(/\n/g, ' ')}"`
    : node.name || id;

  return (
    <div className={`node-entry ${isChanged ? 'node-changed' : ''}`}>
      <button className="node-header" onClick={() => setOpen((o) => !o)}>
        <span className="node-icon">{icon}</span>
        <span className="node-label">{label}</span>
        <span className="node-type">{node.type}</span>
        {isChanged && <span className="changed-dot" title="Modified">●</span>}
        <span className="toggle">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <pre className="node-json">{JSON.stringify(node, null, 2)}</pre>
      )}
    </div>
  );
}

export default function JsonViewer({ layout, previousLayout }) {
  const [copied, setCopied] = useState(false);

  const changedIds = useMemo(() => {
    if (!previousLayout) return new Set();
    const s = new Set();
    for (const id of Object.keys(layout?.nodes || {})) {
      if (JSON.stringify(layout.nodes[id]) !== JSON.stringify(previousLayout?.nodes?.[id])) {
        s.add(id);
      }
    }
    return s;
  }, [layout, previousLayout]);

  const artboard = Object.values(layout?.nodes || {}).find((n) => n.type === 'artboard');
  const entries = Object.entries(layout?.nodes || {});

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(layout, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'layout.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="json-viewer">
      <div className="json-toolbar">
        <span className="json-title">Layout JSON</span>
        <div className="json-actions">
          {changedIds.size > 0 && (
            <span className="changed-badge">{changedIds.size} node{changedIds.size > 1 ? 's' : ''} changed</span>
          )}
          {artboard && (
            <span className="dim-badge">
              {Math.round(artboard.width)}×{Math.round(artboard.height)}
            </span>
          )}
          <button className="icon-btn" onClick={handleCopy} title="Copy JSON">
            {copied ? '✓' : '⎘'}
          </button>
          <button className="icon-btn" onClick={handleDownload} title="Download JSON">
            ↓
          </button>
        </div>
      </div>

      <div className="node-list">
        {entries.map(([id, node]) => (
          <NodeEntry
            key={id}
            id={id}
            node={node}
            isChanged={changedIds.has(id)}
          />
        ))}
      </div>
    </div>
  );
}
