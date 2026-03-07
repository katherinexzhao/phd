const express = require('express');
const router = express.Router();
const axios = require('axios');
const OpenAI = require('openai');

const CORE_API_KEY = process.env.CORE_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!CORE_API_KEY) {
  console.error('CORE_API_KEY is not set in environment variables');
}

if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

router.get('/search', async (req, res) => {
  const { query, page } = req.query;
  if (!query) return res.status(400).json({ error: 'Missing query' });
  const limit = 50;
  const pageNum = parseInt(page) || 1;
  const offset = (pageNum - 1) * limit;

  try {
    // Call Core API (adjust endpoint/params as needed)
    const coreRes = await axios.get('https://api.core.ac.uk/v3/search/works', {
      params: { q: query, limit, offset },
      headers: { 'Authorization': `Bearer ${CORE_API_KEY}` }
    });
    res.json({
      results: coreRes.data.results || [],
      totalHits: coreRes.data.totalHits || 0,
      page: pageNum,
      limit
    });
  } catch (err) {
    console.error('[Core API Error]', err?.response?.data || err.message || err);
    res.status(500).json({ error: 'Core API search failed' });
  }
});

router.post('/study-plan/generate', async (req, res) => {
  const { topic, goal, level, timeCommitment, learningStyle, outputFormat, additionalPreferences } = req.body;

  if (!topic || !goal) {
    return res.status(400).json({ error: 'Topic and Goal are required.' });
  }

  const prompt = `Generate a personalized study plan based on the following information:
  Topic: ${topic}
  Goal: ${goal}
  Current Level: ${level}
  Time Commitment: ${timeCommitment}
  Learning Style: ${learningStyle}
  Output Format: ${outputFormat}
  Additional Preferences: ${additionalPreferences || 'None'}

  The study plan should be structured and comprehensive, covering key concepts, recommended resources, and a suggested timeline. Please provide the output in a well-formatted, readable text, potentially using markdown for structure.`;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // You can choose a different model like "gpt-4" if available
      messages: [{
        role: "user",
        content: prompt
      }],
    });

    const text = chatCompletion.choices[0].message.content;

    res.json({ plan: text });
  } catch (error) {
    console.error('Error generating study plan:', error);
    res.status(500).json({ error: 'Failed to generate study plan via AI.' });
  }
});

module.exports = router; 