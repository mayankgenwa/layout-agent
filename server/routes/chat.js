import { Router } from 'express';
import { buildSystemPrompt } from '../prompts/systemPrompt.js';
import { callLLM } from '../services/llmService.js';
import { validateLayout } from '../utils/jsonValidator.js';
import { resizeArtboard } from '../services/layoutTransforms.js';

const router = Router();

function detectAspectRatio(message) {
  const msg = message.toLowerCase();
  if (msg.includes('9:16') || msg.includes('story') || msg.includes('reel'))
    return { width: 1080, height: 1920 };
  if (msg.includes('16:9') || msg.includes('youtube') || msg.includes('landscape'))
    return { width: 1920, height: 1080 };
  if (msg.includes('4:5') || msg.includes('portrait'))
    return { width: 1080, height: 1350 };
  if (msg.includes('1:1') || msg.includes('square'))
    return { width: 1080, height: 1080 };
  return null;
}

router.post('/', async (req, res) => {
  const { message, layout, history = [] } = req.body;

  if (!message || typeof message !== 'string')
    return res.status(400).json({ error: 'message is required' });
  if (!layout || !layout.nodes)
    return res.status(400).json({ error: 'layout is required' });

  try {
    const targetRatio = detectAspectRatio(message);
    const workingLayout = targetRatio
      ? resizeArtboard(layout, targetRatio.width, targetRatio.height)
      : layout;

    const systemPrompt = buildSystemPrompt(workingLayout);
    const trimmedHistory = (history || []).slice(-6);

    const enrichedMessage = targetRatio
      ? `${message} (artboard already resized to ${targetRatio.width}x${targetRatio.height} — now redistribute elements intelligently for this format)`
      : message;

    const result = await callLLM(systemPrompt, trimmedHistory, enrichedMessage);

    if (!result.updatedLayout) throw new Error('LLM response missing "updatedLayout" field');
    if (!result.explanation) throw new Error('LLM response missing "explanation" field');

    validateLayout(result.updatedLayout);

    return res.json({ explanation: result.explanation, updatedLayout: result.updatedLayout });
  } catch (err) {
    console.error('[/api/chat error]', err.message);

    if (err instanceof SyntaxError)
      return res.status(422).json({ error: 'The AI returned malformed JSON. Please try rephrasing.' });

    if (['layout', 'Root', 'Child', 'Artboard', 'Node'].some(k => err.message.startsWith(k)))
      return res.status(422).json({ error: `Layout validation failed: ${err.message}` });

    return res.status(500).json({ error: err.message });
  }
});

export default router;