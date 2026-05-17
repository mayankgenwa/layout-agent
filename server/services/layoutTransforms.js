export function resizeArtboard(layout, newWidth, newHeight) {
  const updated = structuredClone(layout);
  const rootId = updated.rootNodes[0];
  const artboard = updated.nodes[rootId];

  artboard.width = newWidth;
  artboard.height = newHeight;

  (artboard.children || []).forEach((childId) => {
    const node = updated.nodes[childId];
    if (!node) return;
    node.x = node.nx * newWidth;
    node.y = node.ny * newHeight;
    node.width = node.nw * newWidth;
    node.height = node.nh * newHeight;

    // Rescale font size using ratio if present
    if (node.fontSizeRatio && node.style?.visual) {
      node.style.visual.fontSize = Math.round(node.fontSizeRatio * newWidth);
    }
  });

  return updated;
}

export function moveNode(layout, nodeId, position, delta) {
  const updated = structuredClone(layout);
  const rootId = updated.rootNodes[0];
  const artboard = updated.nodes[rootId];
  const node = updated.nodes[nodeId];
  if (!node || !artboard) return updated;

  const aw = artboard.width;
  const ah = artboard.height;

  if (delta) {
    node.nx = Math.max(0, Math.min(1, node.nx + delta.dx));
    node.ny = Math.max(0, Math.min(1, node.ny + delta.dy));
  } else if (position) {
    switch (position) {
      case 'top':
        node.ny = 0.03;
        break;
      case 'bottom':
        node.ny = Math.max(0, 1 - node.nh - 0.03);
        break;
      case 'center':
        node.nx = 0.5 - node.nw / 2;
        node.ny = 0.5 - node.nh / 2;
        break;
      case 'left':
        node.nx = 0.02;
        break;
      case 'right':
        node.nx = Math.max(0, 1 - node.nw - 0.02);
        break;
    }
  }

  node.x = node.nx * aw;
  node.y = node.ny * ah;

  return updated;
}

/**
 * Scales a node's size (and font if text) by a multiplier.
 */
export function resizeNode(layout, nodeId, scale) {
  const updated = structuredClone(layout);
  const rootId = updated.rootNodes[0];
  const artboard = updated.nodes[rootId];
  const node = updated.nodes[nodeId];
  if (!node || !artboard) return updated;

  node.width = node.width * scale;
  node.height = node.height * scale;
  node.nw = node.width / artboard.width;
  node.nh = node.height / artboard.height;

  if (node.style?.visual?.fontSize) {
    node.style.visual.fontSize = Math.round(node.style.visual.fontSize * scale);
    if (node.fontSizeRatio) {
      node.fontSizeRatio = node.style.visual.fontSize / artboard.width;
    }
  }

  return updated;
}

/**
 * Finds a node by a semantic role name.
 * Returns nodeId or null.
 */
export function findNodeByRole(layout, role) {
  const roleMap = {
    headline: (n) => n.type === 'text' && n.data?.content?.toLowerCase().includes('luxury'),
    subheadline: (n) => n.type === 'text' && n.data?.content?.toLowerCase().includes('comfort that'),
    product: (n) => n.name === 'Product.png',
    background: (n) => n.name === 'Background.png',
    discount: (n) => n.type === 'text' && n.data?.content?.includes('OFF'),
    badge: (n) => n.type === 'shape' && n.data?.shapeType === 'circle',
    cta: (n) => n.type === 'text' && n.data?.content?.toLowerCase().includes('limited'),
    social: (n) => n.type === 'text' && n.data?.content?.toLowerCase().includes('happy'),
  };

  const matcher = roleMap[role.toLowerCase()];
  if (!matcher) return null;

  return Object.keys(layout.nodes).find((id) => matcher(layout.nodes[id])) || null;
}
