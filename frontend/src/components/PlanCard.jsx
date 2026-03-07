// src/components/PlanCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PlanCard({ plan, index, onDelete }) {
  const navigate = useNavigate();

  console.log("PlanCard data:", plan);

  const summaryTopics = plan.study_plan
    ?.flatMap(week => week.days.map(day => day.topic))
    ?.filter(Boolean)
    ?.slice(0, 3)
    .join(', ');

  return (
    <div
      onClick={() => {
        if (!plan.planId) {
          alert("⚠️ This plan has no ID and cannot be opened.");
          return;
        }
        navigate(`/my-learning/plan/${plan.planId}`);
      }}
      className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer p-4 group relative"
    >
      <h2 className="text-lg font-semibold mb-1 text-gray-800">📘 Plan {index + 1}</h2>
      <p className="text-sm text-gray-600">{summaryTopics || 'No topics'}</p>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
        <button
          className="text-sm text-blue-500 hover:text-red-600"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this plan?')) {
              onDelete(plan.planId);
            }
          }}
        >
          Delete
        </button>
      </div>

      {/* Hover info */}
      <div className="mt-2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition">
        <p><b>Last Updated:</b> {
          plan.updatedAt
            ? new Date(plan.updatedAt).toISOString().split('T')[0]
            : 'N/A'
        }</p>
        <p><b>Days:</b> {plan.study_plan?.flatMap(week => week.days)?.length || 0}</p>
      </div>
    </div>
  );
}