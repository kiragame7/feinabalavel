module.exports = async (req, res) => {
  // Apenas POST é permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const PIXEL_ID = '982187064396690';
  const ACCESS_TOKEN = 'EAANtuTI8qCkBRmUkZBaFIXtpSm2BSdV2ax2xSFhSAaK6PbHdyC0UYwd8OvGGkT3Yq8ySBqaHSbwqDtKFKYYfAumfZBmH4Km2f1QD2LikfrGIGqHwkMQzolK0bEZBr456t577L1cZC96FdIOJ6A7kXhsnIeZCh7Wx66mEHNJAkZAE2cNL1a3ZC79QtayQf6MvwZDZD';

  try {
    const { eventName, eventId, eventSourceUrl, userData, customData, testEventCode } = req.body;

    // Validação básica
    if (!eventName || !eventId) {
      return res.status(400).json({ error: 'eventName and eventId are required' });
    }

    // Construir payload conforme a documentação da Meta
    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          event_source_url: eventSourceUrl || 'https://feinabalavel.vercel.app',
          action_source: 'website',
          user_data: {
            client_user_agent: req.headers['user-agent'] || '',
            client_ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
            fbp: userData?.fbp || null,
            fbc: userData?.fbc || null,
          },
          custom_data: customData || {},
        },
      ],
    };

    // Adicionar código de teste se fornecido
    if (testEventCode) {
      payload.test_event_code = testEventCode;
    }

    // Enviar para a Meta
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    // Log para debug
    console.log(`[CAPI] Event: ${eventName}, Status: ${response.status}, Result:`, result);

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Failed to send event to Meta',
        details: result,
      });
    }

    return res.status(200).json({
      success: true,
      events_received: result.events_received || 1,
      fbs_result: result.fbs_result || null,
    });
  } catch (error) {
    console.error('[CAPI] Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};
