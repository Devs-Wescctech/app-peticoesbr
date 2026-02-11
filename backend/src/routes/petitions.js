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

// GET /api/petitions/:id/pdf - Generate formal parliamentary PDF (abaixo-assinado)
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
      'SELECT * FROM signatures WHERE petition_id = $1 ORDER BY created_date ASC',
      [id]
    );

    const signatures = signaturesResult.rows;
    const accentColor = petition.primary_color || '#6366f1';

    const formatDate = (date) => {
      if (!date) return '-';
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const margin = 60;
    const doc = new PDFDocument({ size: 'A4', margin, bufferPages: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="abaixo-assinado-${petition.slug}.pdf"`);

    doc.pipe(res);

    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - margin * 2;
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 45;
    const bottomLimit = footerY - 20;

    const showCityState = petition.collect_city || petition.collect_state;

    const colNum = margin;
    const colNumW = 35;
    const colName = colNum + colNumW;
    const colDateW = 75;
    const colDate = margin + contentWidth - colDateW;
    let colCityW = 0;
    let colCity = colDate;
    if (showCityState) {
      colCityW = 100;
      colCity = colDate - colCityW;
    }
    const colNameW = colCity - colName;
    const rowHeight = 20;

    const drawTableHeader = (yPos) => {
      doc.rect(colNum, yPos, contentWidth, rowHeight).fill(accentColor);
      const textY = yPos + 5;
      doc.fontSize(9).fillColor('#FFFFFF');
      doc.text('#', colNum + 4, textY, { width: colNumW - 4, lineBreak: false });
      doc.text('Nome Completo', colName + 4, textY, { width: colNameW - 4, lineBreak: false });
      if (showCityState) {
        doc.text('Cidade/UF', colCity + 4, textY, { width: colCityW - 4, lineBreak: false });
      }
      doc.text('Data', colDate + 4, textY, { width: colDateW - 4, lineBreak: false });
      doc.fillColor('#000000');
      return yPos + rowHeight;
    };

    // === PAGE 1: HEADER ===
    doc.fontSize(18).fillColor(accentColor).text('ABAIXO-ASSINADO', margin, margin, {
      align: 'center',
      width: contentWidth,
    });

    let currentY = doc.y + 8;
    doc.moveTo(margin, currentY).lineTo(pageWidth - margin, currentY).strokeColor(accentColor).lineWidth(1.5).stroke();
    currentY += 15;

    doc.fontSize(13).fillColor('#000000').text(petition.title, margin, currentY, {
      align: 'center',
      width: contentWidth,
    });
    currentY = doc.y + 20;

    doc.fontSize(11).fillColor('#1a1a1a').text(
      'Nós, cidadãos brasileiros abaixo-assinados, vimos por meio deste documento manifestar nosso posicionamento e reivindicar providências sobre a seguinte matéria:',
      margin, currentY, { align: 'justify', width: contentWidth }
    );
    currentY = doc.y + 12;

    if (petition.description) {
      doc.fontSize(10).fillColor('#333333').text(petition.description, margin, currentY, {
        align: 'justify',
        width: contentWidth,
      });
      currentY = doc.y + 20;
    }

    // === SUMMARY BOX ===
    const boxPadding = 10;
    let summaryLines = [`Total de assinaturas: ${signatures.length}`];
    if (petition.goal) {
      summaryLines.push(`Meta: ${petition.goal} assinaturas`);
    }
    if (signatures.length > 0) {
      const firstDate = formatDate(signatures[0].created_date);
      const lastDate = formatDate(signatures[signatures.length - 1].created_date);
      summaryLines.push(`Período: ${firstDate} a ${lastDate}`);
    }
    summaryLines.push(`Documento gerado em: ${formatDate(new Date())}`);

    const summaryTextHeight = summaryLines.length * 16 + boxPadding * 2;
    doc.rect(margin, currentY, contentWidth, summaryTextHeight).lineWidth(0.5).strokeColor('#999999').stroke();
    let summaryTextY = currentY + boxPadding;
    summaryLines.forEach((line) => {
      doc.fontSize(9).fillColor('#333333').text(line, margin + boxPadding, summaryTextY, {
        width: contentWidth - boxPadding * 2,
        lineBreak: false,
      });
      summaryTextY += 16;
    });
    currentY = currentY + summaryTextHeight + 20;

    // === SIGNATURE TABLE ===
    if (signatures.length === 0) {
      doc.fontSize(11).fillColor('#666666').text(
        'Nenhuma assinatura registrada até o momento.',
        margin, currentY, { align: 'center', width: contentWidth }
      );
      currentY = doc.y + 30;
    } else {
      doc.fontSize(11).fillColor('#000000').text('LISTA DE SIGNATÁRIOS', margin, currentY, {
        align: 'center',
        width: contentWidth,
      });
      currentY = doc.y + 10;

      currentY = drawTableHeader(currentY);

      signatures.forEach((sig, index) => {
        if (currentY + rowHeight > bottomLimit) {
          doc.addPage();
          currentY = margin;
          currentY = drawTableHeader(currentY);
        }

        const bgColor = index % 2 === 0 ? '#F5F5F5' : '#FFFFFF';
        doc.rect(colNum, currentY, contentWidth, rowHeight).fill(bgColor);

        const textY = currentY + 5;
        doc.fontSize(8).fillColor('#1a1a1a');
        doc.text(String(index + 1), colNum + 4, textY, { width: colNumW - 4, lineBreak: false });
        doc.text(sig.name || '-', colName + 4, textY, { width: colNameW - 8, lineBreak: false });
        if (showCityState) {
          const cityState = [sig.city, sig.state].filter(Boolean).join('/') || '-';
          doc.text(cityState, colCity + 4, textY, { width: colCityW - 4, lineBreak: false });
        }
        doc.text(formatDate(sig.created_date), colDate + 4, textY, { width: colDateW - 4, lineBreak: false });

        currentY += rowHeight;
      });

      doc.moveTo(colNum, currentY).lineTo(colNum + contentWidth, currentY).strokeColor('#999999').lineWidth(0.5).stroke();
      currentY += 5;
    }

    // === CLOSING SECTION ===
    if (currentY + 120 > bottomLimit) {
      doc.addPage();
      currentY = margin;
    }

    currentY += 25;
    doc.fontSize(10).fillColor('#000000').text(
      'Local e data: __________________________________________, _______ de _________________________ de ____________',
      margin, currentY, { align: 'left', width: contentWidth }
    );
    currentY = doc.y + 40;

    doc.moveTo(margin + 100, currentY).lineTo(pageWidth - margin - 100, currentY).strokeColor('#000000').lineWidth(0.5).stroke();
    currentY += 5;
    doc.fontSize(9).fillColor('#333333').text('Assinatura do(a) representante', margin, currentY, {
      align: 'center',
      width: contentWidth,
    });
    currentY = doc.y + 5;
    doc.fontSize(8).fillColor('#666666').text('(Responsável pela entrega deste documento)', margin, currentY, {
      align: 'center',
      width: contentWidth,
    });

    // === LGPD NOTICE ===
    if (petition.lgpd_text) {
      currentY = doc.y + 20;
      if (currentY + 60 > bottomLimit) {
        doc.addPage();
        currentY = margin;
      }
      doc.fontSize(7).fillColor('#888888').text(
        'Aviso de Privacidade (LGPD):',
        margin, currentY, { width: contentWidth }
      );
      currentY = doc.y + 2;
      doc.fontSize(7).fillColor('#888888').text(petition.lgpd_text, margin, currentY, {
        align: 'justify',
        width: contentWidth,
      });
    }

    // === PAGE NUMBERS AND FOOTERS (second pass) ===
    const range = doc.bufferedPageRange();
    const totalPages = range.count;
    for (let i = range.start; i < range.start + totalPages; i++) {
      doc.switchToPage(i);
      doc.fontSize(7).fillColor('#999999').text(
        petition.title,
        margin, footerY, { align: 'left', width: contentWidth, lineBreak: false }
      );
      doc.fontSize(7).fillColor('#999999').text(
        `Página ${i + 1} de ${totalPages}`,
        margin, footerY, { align: 'right', width: contentWidth, lineBreak: false }
      );
    }

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
    
    // Determine the base URL for the QR code
    let baseUrl;
    if (process.env.PUBLIC_URL) {
      // Production: use PUBLIC_URL environment variable (e.g., https://peticoesbr.com.br)
      baseUrl = process.env.PUBLIC_URL.replace(/\/$/, ''); // Remove trailing slash if present
    } else if (process.env.REPLIT_DEV_DOMAIN) {
      // Replit development: use REPLIT_DEV_DOMAIN environment variable
      baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
    } else {
      // Fallback: use request headers (for local development)
      const forwardedProto = req.get('x-forwarded-proto') || 'https';
      const forwardedHost = req.get('x-forwarded-host') || req.get('host');
      baseUrl = `${forwardedProto}://${forwardedHost}`;
    }
    
    const publicUrl = `${baseUrl}/p?s=${petition.slug}`;

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
