import React, { useEffect, useState, useMemo } from 'react';

export default function SavedPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) return;

    fetch(`http://localhost:5001/api/saved-plans?username=${username}`)
      .then(res => res.json())
      .then(data => {
        setPlans(data);
      })
      .catch(err => {
        console.error('❌ Fetch error:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDeletePlan = async (planId) => {
    console.log("🗑️ Trying to delete plan:", planId);
    if (!planId) return;
    try {
      const res = await fetch(`http://localhost:5001/api/plan/${planId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const result = await res.json();
      console.log('✅ Deleted:', result);

      // ✅ 删除后更新前端显示
      setPlans(prev => prev.filter(pl => pl.planId !== planId));
      alert('✅ Plan deleted!');
    } catch (err) {
      console.error('❌ Delete error:', err);
      alert('❌ Failed to delete plan.');
    }
  };

  const parsedPlans = useMemo(() => plans.map(pl => {
    let dataObj = pl.data || pl.content;
    if (typeof dataObj === 'string') {
      try {
        dataObj = JSON.parse(dataObj);
      } catch {
        dataObj = { study_plan: [] };
      }
    }
    return {
      planId: pl.planId,
      study_plan: dataObj.study_plan || [],
      updatedAt: pl.updatedAt
    };
  }), [plans]);

  if (loading) return <p>Loading saved plans…</p>;
  if (!parsedPlans.length) return <p>No saved plans yet.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Saved Study Plans</h1>
      <div className="space-y-6">
        {parsedPlans.map((pl, i) => (
          <div key={pl.planId || i} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">{`Plan ${i + 1}`}</h2>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this plan?')) {
                    handleDeletePlan(pl.planId);
                  }
                }}
                className="text-blue-500 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            </div>

            {pl.study_plan.map((week, wi) => (
              <div key={wi} className="mb-3">
                <h3 className="font-medium text-lg">{week.week}</h3>
                {week.days.map((day, di) => (
                  <ul key={di} className="list-disc list-inside text-sm mb-4">
                    <li><strong>{day.day}:</strong> {day.topic || '—'}</li>

                    {Array.isArray(day.keywords) && (
                      <li><strong>Keywords:</strong> {day.keywords.join(', ')}</li>
                    )}

                    {Array.isArray(day.lesson) && (
                      <li><strong>Lessons:</strong>
                        <ul className="list-circle ml-6">
                          {day.lesson.map((l, li) => (
                            <li key={li}>{l}</li>
                          ))}
                        </ul>
                      </li>
                    )}

                    {Array.isArray(day.quiz) && (
                      <li><strong>Quiz:</strong>
                        <ul className="list-square ml-6">
                          {day.quiz.map((q, qi) => (
                            <li key={qi}>{q}</li>
                          ))}
                        </ul>
                      </li>
                    )}

                    {Array.isArray(day.resources) && (
                      <li><strong>Resources:</strong>
                        <ul className="list-decimal ml-6">
                          {day.resources.map((r, ri) => (
                            <li key={ri}>
                              <a className="text-blue-600 underline" href={r.url} target="_blank" rel="noreferrer">
                                {r.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </li>
                    )}
                  </ul>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}