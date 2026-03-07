const express = require('express');
const router = express.Router();
const { runLLM } = require('../utils/llm');
const { fetchArxivArticles, generatePrompt } = require('../utils/prompt');
const { v4: uuidv4 } = require('uuid');

router.post('/generate-plan', async (req, res) => {
  const { topic, preferences } = req.body;

  if (!topic || !preferences) {
    return res.status(400).json({ error: 'Missing topic or preferences' });
  }

  try {
    const allArticles = await fetchArxivArticles(topic);
    const articles = allArticles.slice(0, 5);  
    const prompt = generatePrompt(topic, articles, preferences);

    const fullPrompt = prompt + `
Please return a 2-week study plan with 7 days each week in **JSON** format like this:
{
  "study_plan": [
    {
      "week": "Week 1",
      "days": [
        {
          "day": "Day 1",
          "topic": "Intro to topic",
          "activity": "Watch a video/read",
          "resources": "URL or article name"
        }
      ]
    }
  ]
}
Return ONLY valid JSON and NOTHING else. Do NOT include explanations, markdown, or comments.
`;

    const result = await runLLM(fullPrompt);
    console.log('🧠 LLM raw result:', result.content);
    const rawContent = result.content;
    const match = result.content.match(/\[[\s\S]*\]/);
    if (!match) {
      throw new Error('No JSON found in LLM response');
    }

    let jsonText = match[0];

    // Clean up formatting errors
    jsonText = jsonText
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (jsonErr) {
      console.error('🛑 JSON parsing failed:', jsonText);
      throw jsonErr;
    }

    const fallbackResources = articles.map(a => ({
      title: a.title,
      url: a.link,
    }));

    parsed.forEach(week => {
  week.days.forEach(day => {
    if (!day.resources || !Array.isArray(day.resources)) {
      const matched = fallbackResources.filter(res =>
        day.keywords?.some(kw =>
          res.title.toLowerCase().includes(kw.toLowerCase())
        )
      );
      day.resources = (matched.length ? matched : fallbackResources).slice(0, 2);
    }
  });
});

    return res.json({ study_plan: parsed });
  } catch (err) {
    console.error('Generation error:', err);
    res.status(500).json({ error: 'Failed to generate plan', detail: err.message });
  }
});

module.exports = router;
