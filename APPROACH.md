# Approach Note

## 1. How I Structured the LLM Prompt

The system prompt (`server/prompts/systemPrompt.js`) is built dynamically on every
request — the current layout JSON is embedded at the bottom so Gemini always has
the full up-to-date state, not a remembered version of it.

The prompt is divided into four clear sections:

**Canvas Rules** — explains the dual coordinate system. Every node has both
absolute pixels (x, y, width, height) and normalized fractions (nx, ny, nw, nh)
relative to the artboard. The prompt gives Gemini the exact formulas:
`nx = x / artboardWidth`, `new_x = nx * newWidth`, so it never guesses the math.

**Semantic Roles** — maps node names and content to design roles so Gemini can
understand natural language targets without needing explicit node IDs. For example:
- `"Luxury Comfort..."` text → headline
- `circle` shape → badge background
- `"20%\nOFF"` text → discount badge text
- `"Product.png"` image → main product

**Transformation Rules** — gives Gemini specific instructions for the most common
operations: what "to the top" means in normalized terms (ny ≈ 0.03–0.08), how much
"smaller" should scale (×0.75), how to redistribute elements vertically after a
9:16 conversion, and how to handle color changes.

**Strict Output Format** — instructs Gemini to return only a raw JSON object with
exactly two fields: `explanation` (a short friendly message) and `updatedLayout`
(the complete updated layout). No markdown fences, no extra commentary. This makes
parsing reliable.

---

## 2. How I Handle JSON Transformations Safely

Three layers of safety are in place:

**Deterministic pre-processing** — For aspect ratio conversions (the most common
and math-heavy operation), the backend detects the intent in `routes/chat.js` using
keyword matching ("9:16", "story", "reel", etc.) and calls `resizeArtboard()` from
`services/layoutTransforms.js` before the LLM is involved. This guarantees the
artboard is exactly 1080×1920 — not an approximation from the LLM. The
pre-resized layout is then passed to Gemini with instructions to redistribute
elements intelligently for the new format.

**Safe parsing** — `llmService.js` wraps `JSON.parse` in a try/catch and strips
markdown code fences before parsing, since models sometimes wrap output in
` ```json ``` ` despite instructions not to.

**Structural validation** — `utils/jsonValidator.js` checks the parsed result
before it is ever sent back to the frontend:
- `rootNodes` is a non-empty array
- `nodes` is an object
- Every root node ID exists in `nodes`
- Artboard has positive numeric `width` and `height`
- Every child referenced by the artboard exists in `nodes`
- Every non-artboard node has all 8 coordinate fields as numbers

If validation fails, the server returns a 422 with a clear error message and the
frontend shows it as a chat error — the layout is never updated with bad data.

---

## 3. How I Maintain Conversation Context

Display messages and LLM history are kept separate intentionally.

The `useLayoutAgent` hook maintains two distinct stores:
- `messages` (useState) — the full chat display including the greeting, error
  messages, and undo confirmations
- `llmHistory` (useRef) — only clean user/assistant pairs from actual LLM exchanges

This separation is important because Gemini (like most LLMs) requires conversation
history to strictly alternate `user → model` starting with a user message. Mixing
in the greeting or error messages would break this pattern and cause API errors.

On every send, the last 6 entries from `llmHistory` (3 pairs) are sent to the
backend alongside the current layout JSON and the new message. This gives Gemini
enough context to resolve follow-up references like "make it bigger", "move it
higher", or "now do the same for the badge" — without sending so much history that
it inflates token usage.

The current layout JSON is always embedded fresh in the system prompt, so Gemini
always reasons from the actual current state rather than its memory of previous
states.

---

## 4. Trade-offs and What I'd Improve With More Time

**Trade-offs made:**

- **Full JSON in system prompt every turn** — Embedding the entire layout JSON on
  every request is reliable (Gemini always has ground truth) but costs more tokens.
  For a larger, more complex layout this would get expensive. A diff-based approach
  would be more efficient but harder to implement reliably.

- **LLM handles most transformations** — Only aspect ratio conversion uses a
  deterministic helper. Operations like "move to top" or "make smaller" are left to
  Gemini. This is flexible but less predictable than pure math. The risk is
  mitigated by the validation layer — bad output is caught and rejected.

- **No persistent history** — Conversation resets on page refresh. The `llmHistory`
  ref lives only in memory for the current session.

- **Single undo level** — Only the immediately previous layout is stored. Multiple
  undos are not supported.

**What I'd improve with more time:**

- **Tool use / function calling** — Instead of asking Gemini to return a full
  layout JSON, use structured function calling where Gemini returns typed actions
  like `{ action: "move", nodeId: "...", position: "top" }` that the backend
  executes deterministically. This would be faster, cheaper, and safer.

- **More deterministic helpers** — Extend `layoutTransforms.js` to handle move,
  resize, and color operations with pure math, leaving Gemini only responsible for
  identifying which node to act on.

- **Click-to-select in the preview** — Let users click a node in the wireframe to
  select it, then type instructions that apply to that specific node, removing
  ambiguity from natural language targeting.

- **localStorage persistence** — Save layout and conversation history to
  localStorage so the session survives a page refresh.

- **Optimistic UI** — Apply the change immediately in the preview and roll back if
  validation fails, instead of waiting for the full round trip.
