# Layout Agent

A chat-based layout agent that lets you modify design JSON using natural language. 
Type instructions like "Convert to 9:16" or "Move the headline to the top" and 
watch the layout JSON and wireframe preview update instantly.

---

## Prerequisites

- Node.js v18 or newer
- An Gemini API key

---

## Setup

### 1. Clone the repo
git clone <your-repo-url>,
cd layout-agent

### 2. Set up the server
cd server,
npm install,
cp .env.example .env,
Open .env and set: GEMINI_API_KEY=your_key_here

### 3. Set up the client
cd ../client,
npm install

### 4. Run

Terminal 1 — server:
cd server,
node index.js
# → http://localhost:3001

Terminal 2 — client:
cd client
npm run dev
# → http://localhost:5173

---

## Example Prompts

| Prompt | What happens |
|---|---|
| Convert this design to 9:16 | Artboard becomes 1080×1920, elements redistribute |
| Keep the product large | Product image stays prominent (works as follow-up) |
| Move the headline to the top | Headline text repositions near top of canvas |
| Move the offer badge higher | Discount circle + "20% OFF" text move up |
| Make the headline smaller | Headline font size reduces by ~25% |
| Make the discount badge bigger | Circle and badge text scale up |
| Change the headline color to red | Headline color updates in JSON |
| Center the product | Product image centers horizontally |
| Reset to original layout | Restores initial JSON instantly (no API call) |

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| LLM | Gemini (Google Generative AI SDK) |
| State | React useState + useRef (custom hook) |
| Preview | Absolute-positioned divs with normalized coordinates |
