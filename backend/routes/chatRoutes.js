const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/chat', async (req, res) => {
  const { message, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Missing message' });
  }

  try {
    const messages = [];

    if (context) {
      messages.push({
        role: 'system',
        content: `You are a tutor helping the user understand a study plan. Plan details: ${JSON.stringify(context, null, 2)}User's question:${message}. Please answer informatively and helpfully.`
      });
      messages.push({
        role: 'user',
        content: `Here is the study plan:\n\n${JSON.stringify(context, null, 2)}\n\nNow answer the following question:\n${message}`,
      });
    } else {
      messages.push({ role: 'user', content: message });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('❌ Chat error:', err);
    res.status(500).json({ error: 'Chat failed' });
  }
});

module.exports = router;