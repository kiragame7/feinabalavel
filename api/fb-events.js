module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const PIXEL_ID = '982187064396690';
  const ACCESS_TOKEN = 'EAANtuTI8qCkBRmUkZBaFIXtpSm2BSdV2ax2xSFhSAaK6PbHdyC0UYwd8OvGGkT3Yq8ySBqaHSbwqDtKFKYYfAumfZBmH4Km2f1QD2LikfrGIGqHwkMQzolK0bEZBr456t577L1cZC96FdIOJ6A7kXhsnIeZCh7Wx66mEHNJAkZAE2cNL1a3ZC79QtayQf6MvwZDZD';
  
  const { eventName, eventId, eventSourceUrl, userData, customData, testEventCode } = req.body;

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: eventSourceUrl,
        action_source: 'website',
        user_data: {
          client_user_agent: req.headers['user-agent'],
          client_ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          fbp: userData?.fbp,
          fbc: userData?.fbc
        },
        custom_data: customData || {}
      }
    ]
  };

  if (testEventCode) {
    payload.test_event_code = testEventCode;
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send event to Meta', details: error.message });
  }
};
