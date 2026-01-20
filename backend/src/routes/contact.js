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

    const payload = {
      name,
      email,
      phone: phone || '',
      company: company || '',
      service: service || 'Petições',
      message,
      source: source || 'PetiçõesBR'
    };

    console.log('Sending contact to WesccTech API:', JSON.stringify(payload, null, 2));

    const response = await fetch('https://wescc.replit.app/api/external/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log('WesccTech API response status:', response.status);
    console.log('WesccTech API response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse API response as JSON:', responseText);
      return res.status(502).json({ 
        success: false, 
        error: `API retornou resposta inválida: ${response.status} - ${responseText.substring(0, 100)}` 
      });
    }
    
    if (response.ok && data.success) {
      return res.json({ success: true, message: 'Mensagem enviada com sucesso' });
    } else {
      console.error('WesccTech API error:', data);
      let errorMessage = data.error || data.message || 'Erro ao enviar mensagem';
      if (data.details && data.details.length > 0) {
        errorMessage = data.details.map(d => d.message).join(', ');
      }
      return res.status(response.status || 500).json({ 
        success: false, 
        error: errorMessage 
      });
    }
  } catch (error) {
    console.error('Error sending contact:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor: ' + error.message 
    });
  }
});

export default router;
