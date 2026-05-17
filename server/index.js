import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import chatRoute from './routes/chat.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/chat', chatRoute);

app.get('/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Layout Agent server running on port ${PORT}`);
});
