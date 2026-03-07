// File: backend/routes/audio.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel

router.post('/generate-audio', async (req, res) => {
  const { text, filename } = req.body;

  if (!text || !filename) {
    return res.status(400).json({ error: 'Missing text or filename' });
  }

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        text,
        voice_settings: { stability: 0.5, similarity_boost: 0.8 }
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer',
      }
    );

    const outputPath = path.join(__dirname, '../../frontend/public/audio/', filename);
    console.log('🎧 Saving audio to:', outputPath);
    fs.writeFileSync(outputPath, response.data);

    res.json({ message: 'Audio generated', url: `/audio/${filename}` });
  } catch (err) {
  const raw = err.response?.data;
  const errorMessage = Buffer.isBuffer(raw)
    ? raw.toString('utf-8')
    : (raw || err.message);

  console.error('❌ Error generating audio:', errorMessage);
  res.status(500).json({ error: 'Failed to generate audio', details: errorMessage });
}
});

module.exports = router;