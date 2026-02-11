import express from 'express';
import pool from '../config/database.js';
import { authenticate, requireTenant, optionalAuthenticate } from '../middleware/auth.js';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

const router = express.Router();

// GET /api/petitions - List all petitions for the authenticated tenant
router.get('/', authenticate, requireTenant, async (req, res) => {
  try {
    const { tenantId } = req.user;
    
    const result = await pool.query(
      'SELECT * FROM petitions WHERE tenant_id = $1 ORDER BY created_date DESC',
      [tenantId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// GET /api/petitions/slug/:slug - Public endpoint (no auth required)
// Used for public petition pages
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      'SELECT * FROM petitions WHERE slug = $1',
      [slug]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Petition not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/petitions/:id - Get petition by ID (tenant scoped)
router.get('/:id', authenticate, requireTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    const result = await pool.query(
      'SELECT * FROM petitions WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Petition not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/petitions - Create new petition (tenant scoped)
router.post('/', authenticate, requireTenant, async (req, res) => {
  try {
    const { tenantId } = req.user;
    const {
      title, description, banner_url, logo_url, primary_color,
      share_text, goal, status, slug, collect_phone, collect_city,
      collect_state, collect_cpf, collect_comment, lgpd_text, collect_email, video_url
    } = req.body;
    
    console.log('📝 Creating petition:', { title, slug, tenantId });
    
    const result = await pool.query(
      `INSERT INTO petitions (
        title, description, banner_url, logo_url, primary_color,
        share_text, goal, status, slug, collect_phone, collect_city,
        collect_state, collect_cpf, collect_comment, tenant_id, lgpd_text, collect_email, video_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        title, description, banner_url, logo_url, primary_color || '#6366f1',
        share_text, goal || 1, status || 'rascunho', slug,
        collect_phone || false, collect_city || false, collect_state || false,
        collect_cpf || false, collect_comment || false, tenantId, lgpd_text || null, collect_email || false, video_url || null
      ]
    );
    
    console.log('✅ Petition created:', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creating petition:', error.message, error.code);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Slug já existe' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/petitions/:id - Update petition (tenant scoped)
router.put('/:id', authenticate, requireTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    const {
      title, description, banner_url, logo_url, primary_color,
      share_text, goal, status, slug, collect_phone, collect_city,
      collect_state, collect_cpf, collect_comment, lgpd_text, collect_email, video_url
    } = req.body;
    
    const result = await pool.query(
      `UPDATE petitions SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        banner_url = COALESCE($3, banner_url),
        logo_url = COALESCE($4, logo_url),
        primary_color = COALESCE($5, primary_color),
        share_text = COALESCE($6, share_text),
        goal = COALESCE($7, goal),
        status = COALESCE($8, status),
        slug = COALESCE($9, slug),
        collect_phone = COALESCE($10, collect_phone),
        collect_city = COALESCE($11, collect_city),
        collect_state = COALESCE($12, collect_state),
        collect_cpf = COALESCE($13, collect_cpf),
        collect_comment = COALESCE($14, collect_comment),
        lgpd_text = $15,
        collect_email = COALESCE($16, collect_email),
        video_url = $17,
        updated_date = CURRENT_TIMESTAMP
      WHERE id = $18 AND tenant_id = $19
      RETURNING *`,
      [
        title, description, banner_url, logo_url, primary_color,
        share_text, goal, status, slug, collect_phone, collect_city,
        collect_state, collect_cpf, collect_comment, lgpd_text || null, collect_email, video_url || null, id, tenantId
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Petition not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/petitions/:id - Delete petition (tenant scoped)
router.delete('/:id', authenticate, requireTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    const result = await pool.query(
      'DELETE FROM petitions WHERE id = $1 AND tenant_id = $2 RETURNING *',
      [id, tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Petition not found' });
    }
    
    res.json({ message: 'Petition deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/petitions/:id/pdf - Generate PDF with petition details and signatures
router.get('/:id/pdf', authenticate, requireTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;

    const petitionResult = await pool.query(
      'SELECT * FROM petitions WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    if (petitionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Petition not found' });
    }

    const petition = petitionResult.rows[0];

    const signaturesResult = await pool.query(
      'SELECT * FROM signatures WHERE petition_id = $1 AND tenant_id = $2 ORDER BY created_at ASC',
      [id, tenantId]
    );

    const signatures = signaturesResult.rows;
    const accentColor = petition.primary_color || '#6366f1';

    const formatDate = (date) => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="peticao-${petition.slug}.pdf"`);

    doc.pipe(res);

    doc.rect(0, 0, doc.page.width, 4).fill(accentColor);

    doc.fontSize(22).fillColor(accentColor).text(petition.title, 50, 30, { align: 'center' });
    doc.moveDown(0.5);

    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor(accentColor).lineWidth(1).stroke();
    doc.moveDown(0.5);

    if (petition.description) {
      doc.fontSize(11).fillColor('#333333').text(petition.description, { align: 'justify' });
      doc.moveDown(1);
    }

    doc.fontSize(12).fillColor('#000000').text(`Total de assinaturas: ${signatures.length}`, { continued: petition.goal ? true : false });
    if (petition.goal) {
      doc.text(` / Meta: ${petition.goal}`);
    }
    doc.moveDown(1);

    const tableTop = doc.y;
    const colNum = 50;
    const colName = 90;
    const colEmail = 280;
    const colDate = 450;
    const rowHeight = 20;

    const drawTableHeader = () => {
      doc.rect(colNum, doc.y, doc.page.width - 100, rowHeight).fill(accentColor);
      doc.fontSize(10).fillColor('#FFFFFF');
      doc.text('#', colNum + 5, doc.y + 5, { width: 35 });
      doc.text('Nome', colName + 5, doc.y + 5, { width: 185 });
      doc.text('Email', colEmail + 5, doc.y + 5, { width: 165 });
      doc.text('Data', colDate + 5, doc.y + 5, { width: 95 });
      doc.y += rowHeight;
      doc.fillColor('#000000');
    };

    drawTableHeader();

    signatures.forEach((sig, index) => {
      if (doc.y + rowHeight > doc.page.height - 80) {
        doc.addPage();
        doc.rect(0, 0, doc.page.width, 4).fill(accentColor);
        doc.y = 30;
        drawTableHeader();
      }

      const bgColor = index % 2 === 0 ? '#F9FAFB' : '#FFFFFF';
      doc.rect(colNum, doc.y, doc.page.width - 100, rowHeight).fill(bgColor);

      const rowY = doc.y + 5;
      doc.fontSize(9).fillColor('#333333');
      doc.text(String(index + 1), colNum + 5, rowY, { width: 35 });
      doc.text(sig.name || '-', colName + 5, rowY, { width: 185 });
      doc.text(sig.email || '-', colEmail + 5, rowY, { width: 165 });
      doc.text(sig.created_at ? formatDate(sig.created_at) : '-', colDate + 5, rowY, { width: 95 });

      doc.y += rowHeight;
    });

    doc.moveDown(2);
    const footerY = doc.page.height - 50;
    doc.fontSize(8).fillColor('#999999').text(
      `Documento gerado em ${formatDate(new Date())}`,
      50, footerY, { align: 'center', width: doc.page.width - 100 }
    );

    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/petitions/:id/qrcode - Generate QR Code for public petition page
router.get('/:id/qrcode', authenticate, requireTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;

    const result = await pool.query(
      'SELECT slug FROM petitions WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Petition not found' });
    }

    const petition = result.rows[0];
    const publicUrl = `${req.protocol}://${req.get('host')}/p?s=${petition.slug}`;

    const qrBuffer = await QRCode.toBuffer(publicUrl, {
      type: 'png',
      width: 400,
      margin: 2,
    });

    res.setHeader('Content-Type', 'image/png');
    res.send(qrBuffer);
  } catch (error) {
    console.error('Error generating QR Code:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
