import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Personalized Plan Page
 */

const PersonalizedPlan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [studyPlan, setStudyPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parse plan data from router state
  useEffect(() => {
    try {
      const raw = location.state?.plan;
      let parsed;
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
    } catch {
      setError('Failed to parse study plan.');
      setLoading(false);
    }
  }, [location.state]);

  // Save the study plan to backend
  const handleSavePlan = async () => {
    const username = localStorage.getItem('username');
    if (!username) {
      alert('Please log in to save your plan.');
      return;
    }

    const payload = {
      username,
    plan: studyPlan
  };

  console.log('🧾 Plan to save:', JSON.stringify(payload, null, 2));

  try {
    const res = await fetch('http://localhost:5001/api/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    console.log('✅ Plan saved:', json);
    alert('✅ Study plan saved!');
  } catch (err) {
    console.error('❌ Save plan error:', err);
    alert('❌ Failed to save plan.');
  }
};

  // Early returns
  if (loading) return <div className="text-center mt-10">Loading your personalized study plan...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!studyPlan.length) {
    return (
      <div className="text-center mt-10">
        <p>No study plan available. Please go back to the personalized form to generate one.</p>
        <button
          onClick={() => navigate('/personalized')}
          className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Generate New Plan
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Save button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">
            📘 Your Weekly Daily Study Plan
          </h1>
          <button
            onClick={handleSavePlan}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
          >
            Save Plan
          </button>
        </div>

        {studyPlan.map((week, weekIdx) => (
          <div key={weekIdx} className="mb-12">
            <h2 className="text-3xl font-bold text-gray-700 mb-6">
              {week.week || `Week ${weekIdx + 1}`}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(week.days || []).map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  className="bg-white rounded-xl shadow-md p-6 border-t-4 border-gray-500 hover:shadow-lg transition-all duration-200"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {day.day || `Day ${dayIdx + 1}`}
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                    {day.topic && (
                      <li>
                        <strong>Topic:</strong> {day.topic}
                      </li>
                    )}
                    {Array.isArray(day.keywords) && day.keywords.length > 0 && (
                      <li>
                        <strong>Keywords:</strong> {day.keywords.join(', ')}
                      </li>
                    )}
                  </ul>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() =>
                        navigate(`/paper/${day.id || `${weekIdx}_${dayIdx}`}`, { state: { day } })
                      }
                      className="w-10 h-10 bg-gray-600 text-white rounded-full shadow-md hover:bg-gray-700 hover:scale-105 transition-all duration-200 flex items-center justify-center"
                      aria-label="View Full Lesson"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Action bar */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => navigate('/personalized')}
            className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition"
          >
            Generate New Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedPlan;