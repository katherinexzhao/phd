// backend/routes/studyPlan.js
const express = require('express');
const router = express.Router();
const driver = require('../config/neo4j');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/from-saved', async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User {id: $userId})-[:SAVED]->(p:Paper)
      RETURN p.title AS title, p.abstract AS abstract
      LIMIT 5
      `,
      { userId }
    );

    const papers = result.records.map(r => ({
      title: r.get('title'),
      abstract: r.get('abstract'),
    }));

    if (papers.length === 0) {
      return res.status(404).json({ error: 'No saved papers found.' });
    }

    const paperSummaries = papers.map((p, i) =>
      `${i + 1}. Title: ${p.title}\nAbstract: ${p.abstract}`).join('\n\n');

    const prompt = `
The user has saved the following academic papers:

${paperSummaries}

Please create a personalized study plan that helps the user deeply understand these papers. The plan should be structured, concept-based, and suggest learning paths, tools, and prerequisites.
Output in markdown format.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const plan = completion.choices[0].message.content;
    res.json({ plan });

  } catch (err) {
    console.error('Error generating study plan from saved papers:', err);
    res.status(500).json({ error: 'Failed to generate study plan' });
  } finally {
    await session.close();
  }
});

module.exports = router;