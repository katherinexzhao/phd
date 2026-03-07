// generatePodcast.js
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();
const path = require('path');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_2b5ff7feeb0da2b73f74529c2a08deab646275d981560a62';
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // 默认英语 "Rachel"

async function generatePodcastAudio(text, filename = 'lesson.mp3') {
  try {
    const res = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        text,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
        }
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        responseType: 'arraybuffer',
      }
    );

    const outputPath = path.join(__dirname, '../../frontend/public/audio/', filename);
    fs.writeFileSync(outputPath, res.data);
    console.log(`✅ Audio saved to ${filename}`);
  } catch (error) {
    console.error('❌ Error generating audio:', error.response?.data || error.message);
  }
}


const exampleLesson = {
  topic: "Supervised Learning",
  lesson: [
    "Concept: Supervised Learning. Explanation: This is a type of machine learning that uses labeled data to train models.",
    "Concept: Regression. Explanation: Regression is used to predict continuous values such as price or temperature."
  ],
  quiz: [
    { q: "What is supervised learning?", a: "It is a method of training models using labeled data." }
  ]
};

const textToRead = `
Welcome to today's lesson on ${exampleLesson.topic}.
${exampleLesson.lesson.map(l => l).join(' ')}
Now let's review some questions.
${exampleLesson.quiz.map(q => `Question: ${q.q} Answer: ${q.a}`).join(' ')}
`;

generatePodcastAudio(textToRead, 'supervised_learning.mp3');