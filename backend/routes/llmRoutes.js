const express = require('express');
const router = express.Router();
const { runLLM } = require('../utils/llm');
const { fetchArxivArticles, generatePrompt } = require('../utils/prompt');

router.post('/generate-plan', async (req, res) => {
  const { topic, preferences } = req.body;
  if (!topic || !preferences) {
    return res.status(400).json({ error: 'Missing topic or preferences' });
  }

  try {
    const articles = await fetchArxivArticles(topic);
    const prompt = generatePrompt(topic, articles, preferences);
    const result = await runLLM(prompt);
    const match = result.content.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match[0]);

    return res.json(parsed.study_plan ? parsed : { study_plan: parsed });
  } catch (err) {
    console.error('❌ LLM Error:', err);
    return res.status(500).json({ error: 'LLM Failed', detail: err.message });
  }
});

module.exports = router;