import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, service, message, source } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nome, email e mensagem são obrigatórios' 
      });
    }

    const apiKey = process.env.WESCCTECH_API_KEY;
    
    if (!apiKey) {
      console.error('WESCCTECH_API_KEY not configured');
      return res.status(500).json({ 
        success: false, 
        error: 'Configuração do servidor incompleta' 
      });
    }

    const response = await fetch('https://wescctech.replit.app/api/external/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({
        name,
        email,
        phone: phone || '',
        company: company || '',
        service: service || 'Petições',
        message,
        source: source || 'PetiçõesBR'
      })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      return res.json({ success: true, message: 'Mensagem enviada com sucesso' });
    } else {
      console.error('WesccTech API error:', data);
      return res.status(response.status).json({ 
        success: false, 
        error: data.error || 'Erro ao enviar mensagem' 
      });
    }
  } catch (error) {
    console.error('Error sending contact:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

export default router;
