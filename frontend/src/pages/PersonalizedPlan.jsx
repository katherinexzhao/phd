import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useRevalidator } from 'react-router-dom';

const urlify = (text) => {
  if (!text) return '';
  return text.split(/(https?:\/\/[^\s,]+)/g).map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-gray-700 underline break-all">
          {part}
        </a>
      );
    }
    return part;
  });
};

const PersonalizedPlan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [studyPlan, setStudyPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveMsg, setSaveMsg] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    try {
      let raw = location.state?.plan;
      let parsed = null;
      if (!raw) {
        setError('No study plan provided. Please go back and generate one.');
        setLoading(false);
        return;
      }
      if (typeof raw === 'string') {
        parsed = JSON.parse(raw);
      } else if (raw.study_plan) {
        parsed = raw;
      } else if (Array.isArray(raw)) {
        parsed = { study_plan: raw };
      } else {
        parsed = { study_plan: [] };
      }
      console.log('✅ studyPlan from backend:', parsed.study_plan);
      console.log('📚 Each Day Detail:', parsed.study_plan.flatMap(week => week.days));
      setStudyPlan(parsed.study_plan || []);
      setLoading(false);
    } catch (e) {
      setError('Failed to parse study plan.');
      setLoading(false);
    }
  }, [location.state]);

  const handleReturnHome = () => navigate('/home');
  const handleSavePlan = async () => {
    const username = localStorage.getItem('username');
    if (!username) {
      setSaveMsg('User not logged in.');
      return;
    }
    try {
      const res = await fetch('http://localhost:5001/api/plan/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          plan: {study_plan: studyPlan},
        }),
      });
      if (res.ok) {
        setSaveMsg('Plan saved successfully!');
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        setSaveMsg('Failed to save plan.');
      }
    } catch {
      setSaveMsg('Failed to save plan.');
    }
  };

  const toggleExpand = (weekIdx, dayIdx) => {
    const key = `${weekIdx}-${dayIdx}`;
    setExpandedCard((prev) => (prev === key ? null : key));
  };

  if (loading) {
    return <div className="text-center mt-10">Loading your personalized study plan...</div>;
  }
  if (error) {
    return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
  }
  if (!studyPlan.length) {
    return (
      <div className="text-center mt-10">
        <p>No study plan available. Please go back to the personalized form to generate one.</p>
        <button
          onClick={() => navigate('/personalized')}
          className="mt-4 px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800"
        >
          Generate New Plan
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          📘 Your Daily Study Plan 
        </h1>
        {studyPlan.map((week, weekIdx) => (
          <div key={weekIdx} className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              {week.week || `Week ${weekIdx + 1}`}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(week.days || []).map((day, dayIdx) => {
                const isExpanded = expandedCard === `${weekIdx}-${dayIdx}`;
                return (
                  <div
                    key={dayIdx}
                    className="bg-white rounded-xl shadow-md p-6 border-t-4 border-gray-500 hover:shadow-lg transition-all duration-200 cursor-pointer"
                    onClick={() => toggleExpand(weekIdx, dayIdx)}
                  >
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {day.day || `Day ${dayIdx + 1}`}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1"><strong>Topic:</strong> {day.topic}</p>
                    {isExpanded && (
                      <div className="text-sm text-gray-700 space-y-2 mt-2">
                        {day.keywords && (
                          <p><strong>Keywords:</strong> {day.keywords.join(', ')}</p>
                        )}
                        {(() => {
                          const lessons = day.lessons || day.lesson || [];
                          return Array.isArray(lessons) && lessons.length > 0 && (
                            <div>
                              <strong>Lessons:</strong>
                              <ul className="list-disc list-inside ml-4">
                                {lessons.map((item, idx) => (
                                  <li key={idx}>
                                    {typeof item === 'string'
                                      ? item
                                      : <><strong>{item.concept}:</strong> {item.explanation}</>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })()}
                        {Array.isArray(day.quiz) && day.quiz.length > 0 && (
                          <div>
                            <strong>Quiz:</strong>
                            <ul className="list-disc list-inside ml-4">
                              {day.quiz.map((item, idx) => (
                                <li key={idx}>
                                  <strong>Q:</strong> {item.question}<br />
                                  <strong>A:</strong> {item.answer}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {Array.isArray(day.resources) && day.resources.length > 0 && (
                          <div>
                            <strong>Resources:</strong>
                            <ul className="list-disc list-inside ml-4">
                              {day.resources.map((res, idx) => {
  const defaultLink = `https://arxiv.org/search/?query=${encodeURIComponent(day.topic)}&searchtype=all`;
  return (
    <li key={idx}>
      {typeof res === 'object' && res.title ? (
        <a
          href={res.url || defaultLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 underline break-all"
        >
          {res.title}
        </a>
      ) : typeof res === 'string' ? urlify(res) : null}
    </li>
  );
})}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div className="flex justify-center gap-6 mt-12 mb-8">
          <button
            onClick={() => navigate('/personalized')}
            className="px-8 py-3 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-800 transition"
          >
            Generate New Plan
          </button>
          <button
            className="px-8 py-3 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-800 transition"
            onClick={handleReturnHome}
          >
            Return to Home
          </button>
          <button
            className="px-8 py-3 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-800 transition"
            onClick={handleSavePlan}
          >
            Save Plan
          </button>
        </div>
        {saveMsg && <div className="text-center text-green-700 bg-green-100 rounded-lg px-4 py-2 mb-8">{saveMsg}</div>}
      </div>
    </div>
  );
};

export default PersonalizedPlan;