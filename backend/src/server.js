import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initDatabase } from './utils/initDatabase.js';
import pool from './config/database.js';

import authRouter from './routes/auth.js';
import tenantsRouter from './routes/tenants.js';
import petitionsRouter from './routes/petitions.js';
import signaturesRouter from './routes/signatures.js';
import campaignsRouter from './routes/campaigns.js';
import campaignLogsRouter from './routes/campaign-logs.js';
import messageTemplatesRouter from './routes/message-templates.js';
import linktreePagesRouter from './routes/linktree-pages.js';
import linkbioPagesRouter from './routes/linkbio-pages.js';
import uploadRouter from './routes/upload.js';
import usersRouter from './routes/users.js';
import adminRouter from './routes/admin.js';
import contactRouter from './routes/contact.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', true);
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/tenants', tenantsRouter);
app.use('/api/users', usersRouter);
app.use('/api/petitions', petitionsRouter);
app.use('/api/signatures', signaturesRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/campaign-logs', campaignLogsRouter);
app.use('/api/message-templates', messageTemplatesRouter);
app.use('/api/linktree-pages', linktreePagesRouter);
app.use('/api/linkbio-pages', linkbioPagesRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/contact', contactRouter);

// Utility function to escape HTML and prevent XSS
function escapeHtml(text) {
  if (!text) return '';
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  return text.replace(/[&<>"'\/]/g, (char) => escapeMap[char]);
}

app.get('/api/share/petition/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      'SELECT title, description, logo_url, banner_url, slug FROM petitions WHERE slug = $1',
      [slug]
    );

    if (result.rows.length === 0) {
      return res.redirect('/');
    }

    const petition = result.rows[0];
    const description = petition.description
      ? petition.description.substring(0, 200)
      : '';

    // Escape title and description to prevent XSS
    const escapedTitle = escapeHtml(petition.title);
    const escapedDescription = escapeHtml(description);
    const escapedSlug = escapeHtml(petition.slug);

    let baseUrl;
    if (process.env.PUBLIC_URL) {
      baseUrl = process.env.PUBLIC_URL.replace(/\/$/, '');
    } else if (process.env.REPLIT_DEV_DOMAIN) {
      baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
    } else {
      const forwardedProto = req.get('x-forwarded-proto') || 'https';
      const forwardedHost = req.get('x-forwarded-host') || req.get('host');
      baseUrl = `${forwardedProto}://${forwardedHost}`;
    }

    const imageUrl = petition.logo_url || petition.banner_url || '';
    const absoluteImageUrl = imageUrl
      ? (imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`)
      : '';
    const canonicalUrl = `${baseUrl}/p?s=${escapedSlug}`;
    const redirectUrl = `/p?s=${escapedSlug}`;

    // Start building the HTML with meta tags
    let metaTags = `  <title>${escapedTitle}</title>
  <meta property="og:title" content="${escapedTitle}" />
  <meta property="og:description" content="${escapedDescription}" />`;

    // Only include og:image and twitter:image if images exist
    if (absoluteImageUrl) {
      metaTags += `\n  <meta property="og:image" content="${absoluteImageUrl}" />`;
    }

    metaTags += `\n  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="PetiçõesBR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapedTitle}" />
  <meta name="twitter:description" content="${escapedDescription}" />`;

    // Only include twitter:image if images exist
    if (absoluteImageUrl) {
      metaTags += `\n  <meta name="twitter:image" content="${absoluteImageUrl}" />`;
    }

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
${metaTags}
  <meta http-equiv="refresh" content="0;url=${redirectUrl}">
</head>
<body>
  <p>Redirecionando...</p>
  <script>window.location.href = '${redirectUrl}';</script>
</body>
</html>`;

    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error in OG share route:', error);
    res.redirect('/');
  }
});

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
