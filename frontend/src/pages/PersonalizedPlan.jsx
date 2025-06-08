import React, { useState } from 'react';

function PersonalizedPlan() {
  const [topic, setTopic] = useState('');
  const [expertise, setExpertise] = useState('beginner');
  const [time, setTime] = useState('5 hours/week');
  const [style, setStyle] = useState('visual');
  const [format, setFormat] = useState('bullet points');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a topic before generating.');
      return;
    }
    setLoading(true);
    setError(null);
    setPlan('');
    setSubmitted(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/generate-plan/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          expertise_level: expertise,
          time_commitment: time,
          learning_style: style,
          output_format: format
        })
      });

      const data = await res.json();
      setPlan(data.study_plan || data.message);
    } catch (err) {
      setError('❌ Failed to fetch study plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📚 Personalized Study Plan Generator</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter your topic"
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Expertise Level</label>
            <select value={expertise} onChange={(e) => setExpertise(e.target.value)} className="w-full p-2 border border-gray-300 rounded">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label>Time Commitment</label>
            <select value={time} onChange={(e) => setTime(e.target.value)} className="w-full p-2 border border-gray-300 rounded">
              <option value="3 hours/week">3 hrs/week</option>
              <option value="5 hours/week">5 hrs/week</option>
              <option value="10 hours/week">10 hrs/week</option>
            </select>
          </div>
          <div>
            <label>Learning Style</label>
            <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full p-2 border border-gray-300 rounded">
              <option value="visual">Visual</option>
              <option value="auditory">Auditory</option>
              <option value="kinesthetic">Kinesthetic</option>
              <option value="reading/writing">Reading/Writing</option>
            </select>
          </div>
          <div>
            <label>Output Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full p-2 border border-gray-300 rounded">
              <option value="bullet points">Bullet Points</option>
              <option value="summary + quiz">Summary + Quiz</option>
              <option value="outline + reflection">Outline + Reflection</option>
            </select>
          </div>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Plan'}
        </button>
      </form>

      {error && <div className="text-red-500 mt-4">{error}</div>}
      {submitted && plan && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">✅ Generated Study Plan:</h2>
          <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">{plan}</pre>
        </div>
      )}
    </div>
  );
}

export default PersonalizedPlan;