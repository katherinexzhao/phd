// src/pages/SavedPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SavedPaperCard from './SavedPaperCard';

const SavedPage = () => {
  const [saved, setSaved] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSaved = async () => {
      const username = localStorage.getItem('username');
      if (!username) return;
      try {
        const res = await fetch(`http://localhost:5001/api/saved?username=${username}`);
        const data = await res.json();
        setSaved(data);
      } catch (err) {
        console.error('❌ Failed to fetch saved papers:', err);
      }
    };

    fetchSaved();
    window.addEventListener('paperDeleted', fetchSaved);
    return () => window.removeEventListener('paperDeleted', fetchSaved);
  }, []);

  const tagList = Object.entries(saved); // e.g. [ ["ML", [...]], ["NLP", [...]] ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Saved Papers</h1>

      {tagList.length === 0 ? (
        <p className="text-gray-600">You haven't saved any papers yet.</p>
      ) : (
        tagList.map(([tag, papers]) => {
         
          const goGenerate = () => {
            navigate('/personalized', { state: { initialTag: tag } });
          };

          return (
            <div key={tag} className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-800">#{tag}</h2>
                <button
                  onClick={goGenerate}
                  className="px-3 py-1 bg-black text-white rounded hover:bg-gray-700 transition"
                >
                  Generate Plan
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {papers.map((paper) => (
                  <SavedPaperCard key={paper.id} {...paper} tag={tag} />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default SavedPage;