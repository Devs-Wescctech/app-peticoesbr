import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initDatabase } from './utils/initDatabase.js';

import petitionsRouter from './routes/petitions.js';
import signaturesRouter from './routes/signatures.js';
import campaignsRouter from './routes/campaigns.js';
import campaignLogsRouter from './routes/campaign-logs.js';
import messageTemplatesRouter from './routes/message-templates.js';
import linktreePagesRouter from './routes/linktree-pages.js';
import linkbioPagesRouter from './routes/linkbio-pages.js';
import uploadRouter from './routes/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/petitions', petitionsRouter);
app.use('/api/signatures', signaturesRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/campaign-logs', campaignLogsRouter);
app.use('/api/message-templates', messageTemplatesRouter);
app.use('/api/linktree-pages', linktreePagesRouter);
app.use('/api/linkbio-pages', linkbioPagesRouter);
app.use('/api/upload', uploadRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

async function startServer() {
  try {
    console.log('🔄 Initializing database...');
    await initDatabase();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`📁 Uploads available at http://localhost:${PORT}/uploads`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
