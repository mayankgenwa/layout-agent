# Approach Note

## How I Structured the LLM Prompt

The system prompt (`server/prompts/systemPrompt.js`) is built dynamically — the current layout JSON is embedded at the bottom on every request. This means Claude always has the full current state without relying on conversation memory alone.

The prompt is structured into four clear sections:

1. **Canvas Rules** — explains the dual coordinate system (absolute + normalized) and the formulas to keep them in sync
2. **Semantic Roles** — maps node names/content to design roles (e.g., `"Luxury Comfort..."` → headline, `circle` → badge background), so Claude can reason about "move the badge" without needing an explicit node ID
3. **Transformation Rules** — specific instructions for the most common operations: aspect ratio conversion, moving elements ("to the top" = ny ~0.03–0.08), resizing text, color changes, and the critical "keep product large" constraint
4. **Strict Output Format** — JSON only, no markdown fences, exact shape `{ explanation, updatedLayout }`

The key design decision was telling Claude to handle *both* math and semantics. For example, converting to 9:16 requires two steps: (a) recompute absolute values from normalized, and (b) intelligently redistribute elements vertically — because pure scaling makes everything too compressed. The prompt walks through both.

---

## How I Handle JSON Transformations Safely

Three layers of safety:

1. **LLM does the transformation** — Claude returns the full updated layout as JSON. It never returns partial diffs; the full object is always returned so we can validate the complete structure.

2. **JSON parsing with fence stripping** — even though the prompt says "no markdown", Claude occasionally wraps output in ` ```json ``` `. `llmService.js` strips these before calling `JSON.parse`.

3. **Structural validation** (`server/utils/jsonValidator.js`) — after parsing, we check:
   - `rootNodes` is a non-empty array
   - `nodes` is an object
   - Every root node ID exists in `nodes`
   - Artboard has positive numeric `width` and `height`
   - Every child referenced by the artboard exists in `nodes`
   - Every non-artboard node has all 8 coordinate fields as numbers

   If validation fails, the server returns a 422 with a descriptive error — the frontend shows it as a chat error message. The layout is not updated.

There are also pure math helpers in `server/services/layoutTransforms.js` (`resizeArtboard`, `moveNode`, `resizeNode`, `findNodeByRole`). These are available as utility functions and could be extended into a "tool use" architecture where Claude returns action objects that the backend executes deterministically — a natural next step.

---

## How I Maintain Conversation Context

The `useLayoutAgent` hook keeps a `messages` array in state. On every send, the last 6 messages are passed to the backend as `history`. The backend forwards these to the Anthropic `messages` parameter alongside the current user message.

This means follow-up instructions work naturally:
- User: "Convert to 9:16"
- User: "Now keep the product large" → Claude knows from context what "the product" refers to
- User: "Make it a bit bigger" → Claude knows "it" refers to the product

The current layout JSON is always embedded fresh in the system prompt (not in the history), so the model always operates on the actual current state, not its memory of it.

---

## Trade-offs and What I'd Improve

**What works well:**
- The normalized coordinate system makes aspect ratio conversions reliable
- Embedding the full JSON in the system prompt every turn is reliable (Claude always has ground truth)
- Semantic role mapping means natural language targets ("the badge", "the headline") work without explicit IDs

**Trade-offs made:**
- **Full JSON every turn vs. diffs** — sending the whole layout each time costs more tokens, but is far more reliable than diffing. With a larger JSON this would become costly; I'd switch to a diff-based approach with a larger context window or smaller layout representation
- **LLM does all math** — for simple operations like "move 10px up", a deterministic helper is faster and cheaper. I scaffolded `layoutTransforms.js` for this and would extend it to handle more operations via a tool-use pattern (Claude returns `{action: "move", nodeId: "...", delta: {dy: -0.05}}`, backend executes it)
- **No persistent history** — conversation resets on page refresh. Would add localStorage or a session store for production

**With more time I'd add:**
- Click-to-select nodes in the wireframe preview
- A "diff mode" showing before/after side by side
- Tool use / function calling so the LLM can call typed actions instead of returning raw JSON (safer, faster)
- Optimistic UI — show the change immediately and revert if validation fails
