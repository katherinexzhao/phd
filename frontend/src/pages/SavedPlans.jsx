import React, { useEffect, useState, useMemo } from 'react';
import PlanCard from '../components/PlanCard';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from "../api";

export default function SavedPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) return;

    fetch(`${API_BASE_URL}/api/saved-plans?username=${username}`)
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
      const res = await fetch(`${API_BASE_URL}/api/plan/${planId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const result = await res.json();
      console.log('✅ Deleted:', result);

     
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
      updatedAt: (() => {
        try {
          if (typeof pl.updatedAt === 'string') {
            return new Date(pl.updatedAt).toISOString();
          } else if (pl.updatedAt instanceof Date) {
            return pl.updatedAt.toISOString();
          }
        } catch {
          return '';
        }
        return '';
      })(),
    };
  }), [plans]);

  if (loading) return <p>Loading saved plans…</p>;
  if (!parsedPlans.length) return <p>No saved plans yet.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Saved Study Plans</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {parsedPlans.map((pl, i) => (
          <PlanCard
            key={pl.planId || i}
            plan={pl}
            index={i}
            onDelete={handleDeletePlan}
            onClick={() => navigate('/plan-detail', { state: { plan: pl.study_plan } })}
          />
        ))}
      </div>
    </div>
  );
}