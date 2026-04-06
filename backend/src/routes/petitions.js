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
      collect_state, collect_cpf, collect_comment, lgpd_text, collect_email, video_url,
      require_email, require_phone, require_location, require_cpf, require_comment
    } = req.body;
    
    console.log('📝 Creating petition:', { title, slug, tenantId });
    
    const result = await pool.query(
      `INSERT INTO petitions (
        title, description, banner_url, logo_url, primary_color,
        share_text, goal, status, slug, collect_phone, collect_city,
        collect_state, collect_cpf, collect_comment, tenant_id, lgpd_text, collect_email, video_url,
        require_email, require_phone, require_location, require_cpf, require_comment
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING *`,
      [
        title, description, banner_url, logo_url, primary_color || '#6366f1',
        share_text, goal || 1, status || 'rascunho', slug,
        collect_phone || false, collect_city || false, collect_state || false,
        collect_cpf || false, collect_comment || false, tenantId, lgpd_text || null, collect_email || false, video_url || null,
        require_email || false, require_phone || false, require_location || false, require_cpf || false, require_comment || false
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
      collect_state, collect_cpf, collect_comment, lgpd_text, collect_email, video_url,
      require_email, require_phone, require_location, require_cpf, require_comment
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
        require_email = COALESCE($20, require_email),
        require_phone = COALESCE($21, require_phone),
        require_location = COALESCE($22, require_location),
        require_cpf = COALESCE($23, require_cpf),
        require_comment = COALESCE($24, require_comment),
        updated_date = CURRENT_TIMESTAMP
      WHERE id = $18 AND tenant_id = $19
      RETURNING *`,
      [
        title, description, banner_url, logo_url, primary_color,
        share_text, goal, status, slug, collect_phone, collect_city,
        collect_state, collect_cpf, collect_comment, lgpd_text || null, collect_email, video_url || null, id, tenantId,
        require_email ?? null, require_phone ?? null, require_location ?? null, require_cpf ?? null, require_comment ?? null
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
    const accentColor = petition.primary_color || '#1a365d';

    const formatDate = (date) => {
      if (!date) return '-';
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const formatDateExtended = (date) => {
      const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      const d = new Date(date);
      return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
    };

    const margin = 60;
    const doc = new PDFDocument({ size: 'A4', margin, bufferPages: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="abaixo-assinado-${petition.slug}.pdf"`);

    doc.pipe(res);

    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - margin * 2;
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 40;
    const bottomLimit = footerY - 30;

    const showCityState = petition.collect_city || petition.collect_state;

    const colNum = margin;
    const colNumW = 30;
    const colName = colNum + colNumW;
    const colDateW = 65;
    const colIpW = 80;
    const colDate = margin + contentWidth - colDateW;
    const colIp = colDate - colIpW;
    let colCityW = 0;
    let colCity = colIp;
    if (showCityState) {
      colCityW = 85;
      colCity = colIp - colCityW;
    }
    const colNameW = colCity - colName;
    const rowHeight = 18;

    const drawHorizontalLine = (y, color = '#cccccc', width = 0.5) => {
      doc.moveTo(margin, y).lineTo(pageWidth - margin, y).strokeColor(color).lineWidth(width).stroke();
    };

    const drawTableHeader = (yPos) => {
      doc.rect(colNum, yPos, contentWidth, rowHeight + 2).fill('#2c3e50');
      const textY = yPos + 5;
      doc.fontSize(7.5).fillColor('#FFFFFF');
      doc.text('N.º', colNum + 4, textY, { width: colNumW - 4, lineBreak: false });
      doc.text('NOME COMPLETO', colName + 4, textY, { width: colNameW - 4, lineBreak: false });
      if (showCityState) {
        doc.text('CIDADE / UF', colCity + 4, textY, { width: colCityW - 4, lineBreak: false });
      }
      doc.text('IP ORIGEM', colIp + 4, textY, { width: colIpW - 4, lineBreak: false });
      doc.text('DATA', colDate + 4, textY, { width: colDateW - 4, lineBreak: false });
      doc.fillColor('#000000');
      return yPos + rowHeight + 2;
    };

    // ═══════════════════════════════════════════════
    // CAPA - PRIMEIRA PÁGINA
    // ═══════════════════════════════════════════════

    let currentY = margin;

    doc.rect(0, 0, pageWidth, 6).fill(accentColor);

    currentY = 80;

    doc.fontSize(10).fillColor('#666666').text('DOCUMENTO FORMAL', margin, currentY, {
      align: 'center', width: contentWidth, characterSpacing: 4,
    });
    currentY = doc.y + 20;

    doc.fontSize(26).fillColor('#1a1a1a').text('ABAIXO-ASSINADO', margin, currentY, {
      align: 'center', width: contentWidth,
    });
    currentY = doc.y + 6;

    const lineCenter = pageWidth / 2;
    doc.moveTo(lineCenter - 80, currentY).lineTo(lineCenter + 80, currentY).strokeColor(accentColor).lineWidth(2).stroke();
    currentY += 30;

    doc.fontSize(14).fillColor('#2c3e50').text(petition.title.toUpperCase(), margin, currentY, {
      align: 'center', width: contentWidth, lineGap: 4,
    });
    currentY = doc.y + 40;

    drawHorizontalLine(currentY, '#e0e0e0', 0.5);
    currentY += 25;

    doc.fontSize(11).fillColor('#333333').text(
      'Nós, cidadãos e cidadãs, abaixo-assinados, no exercício dos direitos que nos são assegurados pela Constituição Federal de 1988, vimos respeitosamente, por meio deste instrumento, manifestar nosso posicionamento e reivindicar providências sobre a matéria a seguir descrita.',
      margin, currentY, { align: 'justify', width: contentWidth, lineGap: 3 }
    );
    currentY = doc.y + 25;

    if (petition.description) {
      doc.fontSize(9).fillColor('#888888').text('OBJETO DA PETIÇÃO', margin, currentY, {
        characterSpacing: 2,
      });
      currentY = doc.y + 8;

      doc.moveTo(margin, currentY).lineTo(margin + 40, currentY).strokeColor(accentColor).lineWidth(1.5).stroke();
      currentY += 12;

      doc.fontSize(10.5).fillColor('#333333').text(petition.description, margin, currentY, {
        align: 'justify', width: contentWidth, lineGap: 2.5,
      });
      currentY = doc.y + 30;
    }

    // RESUMO
    const summaryBoxY = currentY;
    const boxPadding = 15;
    const summaryItems = [];
    summaryItems.push({ label: 'Total de Assinaturas', value: String(signatures.length) });
    if (petition.goal) {
      summaryItems.push({ label: 'Meta Estabelecida', value: `${petition.goal} assinaturas` });
    }
    if (signatures.length > 0) {
      const firstDate = formatDate(signatures[0].created_date);
      const lastDate = formatDate(signatures[signatures.length - 1].created_date);
      summaryItems.push({ label: 'Período de Coleta', value: `${firstDate} a ${lastDate}` });
    }
    summaryItems.push({ label: 'Data de Emissão', value: formatDateExtended(new Date()) });

    const summaryBoxHeight = summaryItems.length * 20 + boxPadding * 2;

    doc.rect(margin, summaryBoxY, contentWidth, summaryBoxHeight)
      .lineWidth(0.5).strokeColor('#d0d0d0').stroke();

    doc.rect(margin, summaryBoxY, 3, summaryBoxHeight).fill(accentColor);

    let itemY = summaryBoxY + boxPadding;
    summaryItems.forEach((item) => {
      doc.fontSize(8).fillColor('#888888').text(item.label.toUpperCase(), margin + boxPadding + 5, itemY, {
        width: 140, lineBreak: false, characterSpacing: 0.5,
      });
      doc.fontSize(10).fillColor('#1a1a1a').text(item.value, margin + boxPadding + 150, itemY, {
        width: contentWidth - boxPadding * 2 - 150, lineBreak: false,
      });
      itemY += 20;
    });
    currentY = summaryBoxY + summaryBoxHeight + 15;

    doc.rect(0, pageHeight - 6, pageWidth, 6).fill(accentColor);

    // ═══════════════════════════════════════════════
    // PÁGINAS DE ASSINATURAS
    // ═══════════════════════════════════════════════

    if (signatures.length === 0) {
      doc.addPage();
      doc.rect(0, 0, pageWidth, 3).fill(accentColor);
      currentY = margin + 40;
      doc.fontSize(11).fillColor('#666666').text(
        'Nenhuma assinatura registrada até o momento.',
        margin, currentY, { align: 'center', width: contentWidth }
      );
    } else {
      doc.addPage();
      doc.rect(0, 0, pageWidth, 3).fill(accentColor);

      currentY = margin;
      doc.fontSize(9).fillColor('#888888').text('LISTA DE SIGNATÁRIOS', margin, currentY, {
        align: 'center', width: contentWidth, characterSpacing: 3,
      });
      currentY = doc.y + 5;
      doc.fontSize(7.5).fillColor('#aaaaaa').text(
        `${signatures.length} assinatura${signatures.length !== 1 ? 's' : ''} registrada${signatures.length !== 1 ? 's' : ''}`,
        margin, currentY, { align: 'center', width: contentWidth }
      );
      currentY = doc.y + 15;

      currentY = drawTableHeader(currentY);

      signatures.forEach((sig, index) => {
        if (currentY + rowHeight > bottomLimit) {
          doc.addPage();
          doc.rect(0, 0, pageWidth, 3).fill(accentColor);
          currentY = margin;
          currentY = drawTableHeader(currentY);
        }

        const bgColor = index % 2 === 0 ? '#f8f9fa' : '#FFFFFF';
        doc.rect(colNum, currentY, contentWidth, rowHeight).fill(bgColor);

        doc.moveTo(colNum, currentY + rowHeight)
          .lineTo(colNum + contentWidth, currentY + rowHeight)
          .strokeColor('#e8e8e8').lineWidth(0.3).stroke();

        const textY = currentY + 4;
        doc.fontSize(7.5).fillColor('#888888');
        doc.text(String(index + 1), colNum + 4, textY, { width: colNumW - 4, lineBreak: false });
        doc.fontSize(8).fillColor('#1a1a1a');
        doc.text(sig.name || '-', colName + 4, textY, { width: colNameW - 8, lineBreak: false });
        if (showCityState) {
          const cityState = [sig.city, sig.state].filter(Boolean).join(' / ') || '-';
          doc.fontSize(8).fillColor('#555555');
          doc.text(cityState, colCity + 4, textY, { width: colCityW - 4, lineBreak: false });
        }
        const ipText = sig.ip_address ? (sig.ip_address.length > 15 ? sig.ip_address.substring(0, 15) : sig.ip_address) : '-';
        doc.fontSize(6.5).fillColor('#888888');
        doc.text(ipText, colIp + 4, textY, { width: colIpW - 4, lineBreak: false });
        doc.fontSize(7.5).fillColor('#666666');
        doc.text(formatDate(sig.created_date), colDate + 4, textY, { width: colDateW - 4, lineBreak: false });

        currentY += rowHeight;
      });

      doc.moveTo(colNum, currentY).lineTo(colNum + contentWidth, currentY).strokeColor('#2c3e50').lineWidth(0.5).stroke();
    }

    // ═══════════════════════════════════════════════
    // ENCERRAMENTO
    // ═══════════════════════════════════════════════

    if (currentY + 200 > bottomLimit) {
      doc.addPage();
      doc.rect(0, 0, pageWidth, 3).fill(accentColor);
      currentY = margin;
    } else {
      currentY += 40;
    }

    drawHorizontalLine(currentY, '#e0e0e0', 0.5);
    currentY += 25;

    doc.fontSize(10).fillColor('#333333').text(
      'Pelo presente instrumento, os signatários acima identificados declaram, para os devidos fins, que as informações prestadas são verdadeiras e que manifestam livremente seu apoio à causa descrita neste documento.',
      margin, currentY, { align: 'justify', width: contentWidth, lineGap: 2 }
    );
    currentY = doc.y + 30;

    doc.fontSize(10).fillColor('#333333').text(
      '__________________________, ______ de ______________________ de __________',
      margin, currentY, { align: 'center', width: contentWidth }
    );
    currentY = doc.y + 3;
    doc.fontSize(7.5).fillColor('#999999').text('Local e data', margin, currentY, {
      align: 'center', width: contentWidth,
    });

    currentY = doc.y + 50;

    const sigLineStart = margin + 120;
    const sigLineEnd = pageWidth - margin - 120;
    doc.moveTo(sigLineStart, currentY).lineTo(sigLineEnd, currentY).strokeColor('#333333').lineWidth(0.5).stroke();
    currentY += 6;
    doc.fontSize(8.5).fillColor('#333333').text('Responsável pela entrega', margin, currentY, {
      align: 'center', width: contentWidth,
    });
    currentY = doc.y + 3;
    doc.fontSize(7.5).fillColor('#999999').text('Nome / Assinatura', margin, currentY, {
      align: 'center', width: contentWidth,
    });

    if (petition.lgpd_text) {
      currentY = doc.y + 35;
      if (currentY + 50 > bottomLimit) {
        doc.addPage();
        doc.rect(0, 0, pageWidth, 3).fill(accentColor);
        currentY = margin;
      }
      drawHorizontalLine(currentY, '#e0e0e0', 0.3);
      currentY += 10;
      doc.fontSize(6.5).fillColor('#aaaaaa').text(
        'AVISO DE PRIVACIDADE (LGPD)',
        margin, currentY, { width: contentWidth, characterSpacing: 1 }
      );
      currentY = doc.y + 4;
      doc.fontSize(6.5).fillColor('#aaaaaa').text(petition.lgpd_text, margin, currentY, {
        align: 'justify', width: contentWidth, lineGap: 1.5,
      });
    }

    // ═══════════════════════════════════════════════
    // RODAPÉ E NUMERAÇÃO (segunda passagem)
    // ═══════════════════════════════════════════════

    const range = doc.bufferedPageRange();
    const totalPages = range.count;
    for (let i = range.start; i < range.start + totalPages; i++) {
      doc.switchToPage(i);

      doc.moveTo(margin, footerY - 8).lineTo(pageWidth - margin, footerY - 8)
        .strokeColor('#e0e0e0').lineWidth(0.3).stroke();

      const truncTitle = petition.title.length > 60
        ? petition.title.substring(0, 57) + '...'
        : petition.title;
      doc.fontSize(6.5).fillColor('#bbbbbb').text(
        truncTitle,
        margin, footerY, { align: 'left', width: contentWidth / 2, lineBreak: false }
      );
      doc.fontSize(6.5).fillColor('#bbbbbb').text(
        `Página ${i + 1} de ${totalPages}`,
        margin + contentWidth / 2, footerY, { align: 'right', width: contentWidth / 2, lineBreak: false }
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
