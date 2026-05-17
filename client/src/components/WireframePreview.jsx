

import { useRef, useState, useEffect } from 'react';

function getNodeStyle(node) {
  const base = {
    position: 'absolute',
    left: `${node.nx * 100}%`,
    top: `${node.ny * 100}%`,
    width: `${node.nw * 100}%`,
    height: `${node.nh * 100}%`,
    overflow: 'hidden',
    boxSizing: 'border-box',
  };

  if (node.type === 'image') return { ...base };
  if (node.type === 'text') return { ...base, display: 'flex', alignItems: 'flex-start' };
  if (node.type === 'shape') return { ...base };
  return base;
}

function NodeRenderer({ node, scale }) {
  const style = getNodeStyle(node);

  if (node.type === 'image' && node.name === 'Background.png') {
    return (
      <div style={{ ...style, zIndex: 0 }}>
        <img
          src={node.data?.sourceUrl}
          alt="background"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    );
  }

  if (node.type === 'image' && node.name === 'Product.png') {
    return (
      <div style={{ ...style, zIndex: 2 }}>
        <img
          src={node.data?.sourceUrl}
          alt="product"
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        />
      </div>
    );
  }

  if (node.type === 'image' && node.name?.startsWith('Vector')) {
    return (
      <div style={{ ...style, zIndex: 3 }}>
        <img
          src={node.data?.sourceUrl}
          alt="star"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
    );
  }

  if (node.type === 'shape' && node.data?.shapeType === 'circle') {
    const fill = node.style?.visual?.fill?.value || '#F4CF1B';
    return (
      <div
        style={{
          ...style,
          background: fill,
          borderRadius: '50%',
          zIndex: 1,
        }}
      />
    );
  }

  if (node.type === 'text') {
    const color = node.style?.visual?.color?.value;
    const safeColor = (!color || color === '#FFFF') ? '#ffffff' : color;
    const rawFontSize = node.style?.visual?.fontSize || 16;
    // Scale font size by the same ratio the canvas is scaled
    const scaledFontSize = rawFontSize * scale;
    const fontWeight = node.style?.visual?.fontWeight || 400;
    const fontStyle = node.style?.visual?.fontStyle || 'normal';
    const content = node.data?.content || '';

    return (
      <div
        style={{
          ...style,
          color: safeColor,
          fontSize: `${scaledFontSize}px`,
          fontWeight,
          fontStyle,
          fontFamily: node.style?.visual?.fontFamily || 'Arial, sans-serif',
          lineHeight: 1.2,
          whiteSpace: 'pre-wrap',
          textShadow: '0 1px 4px rgba(0,0,0,0.7)',
          zIndex: 4,
          pointerEvents: 'none',
        }}
      >
        {content}
      </div>
    );
  }

  return null;
}

export default function WireframePreview({ layout }) {
  const containerRef = useRef(null);
  const [previewWidth, setPreviewWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      setPreviewWidth(entries[0].contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  if (!layout?.nodes || !layout?.rootNodes?.length) {
    return <div className="preview-empty">No layout loaded</div>;
  }

  const rootId = layout.rootNodes[0];
  const artboard = layout.nodes[rootId];
  if (!artboard) return <div className="preview-empty">Artboard not found</div>;

  const aspectRatio = artboard.height / artboard.width;
  const scale = previewWidth > 0 ? previewWidth / artboard.width : 1;

  return (
    <div className="wireframe-wrapper">
      <p className="preview-label">
        {artboard.name} — {Math.round(artboard.width)} × {Math.round(artboard.height)}
      </p>
      <div
        ref={containerRef}
        className="wireframe-canvas"
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: `${aspectRatio * 100}%`,
          background: artboard.data?.backgroundColor || '#1a1a1a',
          overflow: 'hidden',
          borderRadius: 8,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ position: 'absolute', inset: 0 }}>
          {(artboard.children || []).map((id) => {
            const node = layout.nodes[id];
            if (!node) return null;
            return <NodeRenderer key={id} node={node} scale={scale} />;
          })}
        </div>
      </div>
    </div>
  );
}
