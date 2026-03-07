function generatePrompt(topic, articles = [], preferences = {}) {
  let prompt = `I want to create a personalized 2-week study plan on the topic: "${topic}".\n`;

  // 用户偏好信息
  if (preferences.expertise_level) {
    prompt += `I am currently at a ${preferences.expertise_level} level.\n`;
  }
  if (preferences.time_commitment) {
    prompt += `I can commit ${preferences.time_commitment} per week.\n`;
  }
  if (preferences.learning_style) {
    prompt += `My preferred learning style is ${preferences.learning_style}.\n`;
  }
  if (preferences.output_format) {
    prompt += `Please structure the output in a ${preferences.output_format} way.\n`;
  }
  if (preferences.additional_preferences) {
    prompt += `Additional notes: ${preferences.additional_preferences}\n`;
  }

  // 附加的参考文献（最多5篇）
  if (articles.length > 0) {
    prompt += `You may use the following arXiv articles as reference:\n`;
    articles.slice(0, 5).forEach((a, idx) => {
      if (typeof a === 'string') {
        prompt += `(${idx + 1}) ${a}\n`;
      } else if (a.title) {
        prompt += `(${idx + 1}) ${a.title}\nAbstract: ${a.summary}\nURL: ${a.link}\n`;
      }
    });
  }

  prompt += `
You are an expert tutor. 
Given the topic "${topic}", generate a 2-week study plan with exactly 5 study days per week, broken down by weeks and days. 
For each day, include:
- topic
- 2-3 keywords
- 2 lessons (as concept + explanation)
- 2 quiz questions with answers
- a list of "resources", each with "title" and "url" from the following articles:

${articles.map(a => `- ${a.title} (${a.link})`).join('\n')}

The response must be in JSON format. Structure:

[
  {
    "week": "Week 1",
    "days": [
      {
        "day": "Day 1",
        "topic": "...",
        "keywords": [...],
        "lesson": [...],
        "quiz": [...],
        "resources": [{"title": "...", "url": "https://..."}, ...]
      },
      ...
    ]
  },
  ...
]

⚠️ Guidelines:
- Return a total of **10 days** organized into **2 weeks**, with **5 study days per week**
- Each day must include:
  - topic
  - 3–5 keywords
  - 2+ lesson items
  - 2–3 Q&A
  - 1–2 resources
  - You must include at least one of the following arXiv papers per day in the "resources" section (use title and link provided above).
  - Additionally, you may add extra resources from YouTube, arXiv, no coursera.
- **Only output valid JSON**, no explanation, no headings, no markdown.`;

  return prompt;
}

const axios = require('axios');
const xml2js = require('xml2js');

async function fetchArxivArticles(topic) {
  const searchQuery = `all:${encodeURIComponent(topic)}`;
  const apiUrl = `http://export.arxiv.org/api/query?search_query=${searchQuery}&start=0&max_results=10`;

  try {
    const response = await axios.get(apiUrl);
    const xml = response.data;

    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xml);

    const entries = result.feed.entry;
    const articles = Array.isArray(entries) ? entries : [entries];

    return articles.map(entry => ({
      title: entry.title.trim(),
      summary: entry.summary.trim(),
      link: entry.id
    }));
  } catch (err) {
    console.error('❌ arXiv fetch error:', err.message);
    return [];
  }
}
module.exports = {
  generatePrompt,
  fetchArxivArticles,
};