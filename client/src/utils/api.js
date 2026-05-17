import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Sends a chat message with the current layout and conversation history.
 * Returns { explanation, updatedLayout }
 */
export async function sendChatMessage({ message, layout, history }) {
  const { data } = await axios.post(`${BASE_URL}/api/chat`, {
    message,
    layout,
    history,
  });
  return data;
}
