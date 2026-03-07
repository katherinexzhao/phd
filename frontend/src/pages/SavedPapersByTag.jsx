

<SelectAllControls
  onSelectAll={() => alert('Select all')}
  onDeselectAll={() => alert('Deselect all')}
  />
import React, { useState } from 'react';
import SavedPaperCard from './SavedPaperCard';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import SelectAllControls from '../components/SelectAllControls';
import { API_BASE_URL } from "../api";



const SavedPapersByTag = ({ papersByTag }) => {
    console.log('📦 papersByTag', papersByTag);
  const [selected, setSelected] = useState({});
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleSelect = (paperId) => {
    setSelected(prev => ({ ...prev, [paperId]: !prev[paperId] }));
  };

  const selectAllInTag = (tag, papers) => {
    const updates = {};
    papers.forEach(p => { updates[p.id] = true; });
    setSelected(prev => ({ ...prev, ...updates }));
  };

  const deselectAllInTag = (tag, papers) => {
    const updates = {};
    papers.forEach(p => { updates[p.id] = false; });
    setSelected(prev => ({ ...prev, ...updates }));
  };

  const handleGeneratePlan = async () => {
    const username = localStorage.getItem('username');
    if (!username) return;

    const selectedPapers = [];
    for (const [tag, papers] of Object.entries(papersByTag)) {
      papers.forEach(p => {
        if (selected[p.id]) selectedPapers.push({ id: p.id, title: p.title, url: p.url });
      });
    }

    if (selectedPapers.length === 0) return;

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/study-plan/from-selected`, {
        username,
        papers: selectedPapers,
      });
      setPlan(res.data.plan || '');
    } catch (err) {
      console.error('Error generating plan:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {Object.entries(papersByTag).map(([tag, papers]) => (
        <div key={tag}>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">{tag}</h2>
            <SelectAllControls
              onSelectAll={() => selectAllInTag(tag, papers)}
              onDeselectAll={() => deselectAllInTag(tag, papers)}
            />
          </div>

          <div className="space-y-4">
            {papers.map(paper => (
              <SavedPaperCard
                key={paper.id}
                id={paper.id}
                title={paper.title}
                url={paper.url}
                checked={!!selected[paper.id]}
                onToggle={toggleSelect}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="text-right">
        <button
          onClick={handleGeneratePlan}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          📘 Generate Plan from Selected Papers
        </button>
      </div>

      {loading && (
        <div className="text-center text-gray-500 mt-4">Generating plan...</div>
      )}

      {plan && (
        <div className="max-w-3xl mx-auto mt-6 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Your Personalized Plan</h2>
          <ReactMarkdown className="prose">{plan}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default SavedPapersByTag;