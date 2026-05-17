export function validateLayout(layout) {
  if (!layout || typeof layout !== 'object') {
    throw new Error('Layout must be a non-null object');
  }
  if (!Array.isArray(layout.rootNodes) || layout.rootNodes.length === 0) {
    throw new Error('layout.rootNodes must be a non-empty array');
  }
  if (!layout.nodes || typeof layout.nodes !== 'object') {
    throw new Error('layout.nodes must be an object');
  }

  for (const id of layout.rootNodes) {
    if (!layout.nodes[id]) {
      throw new Error(`Root node "${id}" missing from layout.nodes`);
    }
  }

  const rootId = layout.rootNodes[0];
  const artboard = layout.nodes[rootId];
  if (typeof artboard.width !== 'number' || typeof artboard.height !== 'number') {
    throw new Error('Artboard must have numeric width and height');
  }
  if (artboard.width <= 0 || artboard.height <= 0) {
    throw new Error('Artboard width and height must be positive');
  }

  if (Array.isArray(artboard.children)) {
    for (const childId of artboard.children) {
      if (!layout.nodes[childId]) {
        throw new Error(`Child node "${childId}" referenced but missing`);
      }
    }
  }

  for (const [id, node] of Object.entries(layout.nodes)) {
    if (node.type === 'artboard') continue;
    for (const field of ['x', 'y', 'width', 'height', 'nx', 'ny', 'nw', 'nh']) {
      if (typeof node[field] !== 'number') {
        throw new Error(`Node "${id}" is missing numeric field "${field}"`);
      }
    }
  }

  return true;
}
