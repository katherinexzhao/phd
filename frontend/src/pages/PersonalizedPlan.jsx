import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const urlify = (text) => {
  if (!text) return '';
  // 匹配所有 http(s) 链接
  return text.split(/(https?:\/\/[^\s,]+)/g).map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
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
      setStudyPlan(parsed.study_plan || []);
      setLoading(false);
    } catch (e) {
      setError('Failed to parse study plan.');
      setLoading(false);
    }
  }, [location.state]);

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
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Generate New Plan
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-indigo-800 mb-12">
          📘 Your Weekly Daily Study Plan
        </h1>
        {studyPlan.map((week, weekIdx) => (
          <div key={weekIdx} className="mb-12">
            <h2 className="text-3xl font-bold text-indigo-700 mb-6">
              {week.week || `Week ${weekIdx + 1}`}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(week.days || []).map((day, dayIdx) => {
                return (
                  <div
                    key={dayIdx}
                    className="bg-white rounded-xl shadow-md p-6 border-t-4 border-indigo-500 hover:shadow-lg transition-all duration-200"
                  >
                    <h3 className="text-xl font-semibold text-indigo-800 mb-2">
                      {day.day || `Day ${dayIdx + 1}`}
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                      {day.topic && <li><strong>Topic:</strong> {day.topic}</li>}
                      {day.activity && <li><strong>Activity:</strong> {day.activity}</li>}
                      {day.resources && (
                        <li>
                          <strong>Resources:</strong>{" "}
                          {Array.isArray(day.resources)
                            ? day.resources.map((res, idx) => {
                                if (typeof res === 'object' && res.url && res.title) {
                                  return (
                                    <span key={idx}>
                                      <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
                                        {res.title}
                                      </a>
                                      {idx < day.resources.length - 1 ? ', ' : ''}
                                    </span>
                                  );
                                }
                                if (typeof res === 'string') {
                                  return <span key={idx}>{urlify(res)}{idx < day.resources.length - 1 ? ', ' : ''}</span>;
                                }
                                return null;
                              })
                            : typeof day.resources === 'object' && day.resources.url && day.resources.title
                            ? (
                              <a href={day.resources.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
                                {day.resources.title}
                              </a>
                            )
                            : typeof day.resources === 'string'
                            ? urlify(day.resources)
                            : null
                          }
                        </li>
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => navigate('/personalized')}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
          >
            Generate New Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedPlan;