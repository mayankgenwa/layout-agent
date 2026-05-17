# Layout Agent

A chat-based layout agent that transforms design JSON using natural language instructions.

## What It Does

- Load a design layout defined by a JSON file (artboard, images, text, shapes)
- Chat with an AI assistant: "Convert to 9:16", "Move the headline to the top", "Make the discount badge bigger"
- Watch the layout JSON update in real time, with a live wireframe preview

---

## Prerequisites

- Node.js v18 or newer
- An Anthropic API key ([get one here](https://console.anthropic.com/))

---

## Setup

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd layout-agent
```

### 2. Set up the server

```bash
cd server
npm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 3. Set up the client

```bash
cd ../client
npm install
```

### 4. Run both

**Terminal 1 — Server:**
```bash
cd server
node index.js
# Running on http://localhost:3001
```

**Terminal 2 — Client:**
```bash
cd client
npm run dev
# Open http://localhost:5173
```

---

## Example Instructions to Try

| Instruction | What Changes |
|---|---|
| `Convert this design to 9:16` | Artboard becomes 1080×1920, elements redistribute |
| `Keep the product large` | Product image stays prominent (follow-up) |
| `Move the headline to the top` | Headline text moves to top of canvas |
| `Move the offer badge higher` | Discount badge circle + text move up |
| `Make the headline smaller` | Headline font size reduces |
| `Make the discount badge bigger` | Circle and "20% OFF" text scale up |
| `Change the headline color to red` | Headline text color updates |
| `Center the product` | Product image centers horizontally |
| `Reset to original layout` | Reverts to initial JSON (no API call) |

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| LLM | Claude (Anthropic SDK) |
| State | React useState / custom hook |
| Preview | Absolute-positioned divs (normalized coords) |

---

## Project Structure

```
layout-agent/
├── client/                    # React frontend
│   └── src/
│       ├── components/
│       │   ├── ChatWindow.jsx
│       │   ├── MessageBubble.jsx
│       │   ├── ChatInput.jsx
│       │   ├── JsonViewer.jsx
│       │   └── WireframePreview.jsx
│       ├── data/
│       │   └── initialLayout.json
│       ├── hooks/
│       │   └── useLayoutAgent.js
│       └── utils/
│           └── api.js
│
└── server/                    # Express backend
    ├── routes/chat.js
    ├── services/
    │   ├── llmService.js
    │   └── layoutTransforms.js
    ├── prompts/systemPrompt.js
    ├── utils/jsonValidator.js
    └── index.js
```
