import React, { useState } from 'react';
import TagPickerModal from './TagPickerModal';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { API_BASE_URL } from "../api";

const SavedPaperCard = ({ id, title, url, checked, onToggle }) => {
  const [openTagModal, setOpenTagModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState('');

  const generatePlan = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/study-plan/from-saved`, { userId });
      setPlan(res.data.plan || '');
    } catch (err) {
      console.error('Failed to generate plan', err);
    } finally {
      setLoading(false);
    }
  };

  // -------- Handle Remove --------
  const handleUnsave = async () => {
    const username = localStorage.getItem('username');
    if (!username) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/unsave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, paperId: id }),
      });
      if (res.ok) window.dispatchEvent(new Event('paperDeleted'));
    } catch (err) {
      console.error('Failed to unsave paper:', err);
    }
  };

  // -------- Handle Tag Update --------
  const saveWithTag = async (tag) => {
    setOpenTagModal(false);
    const username = localStorage.getItem('username');
    if (!username) return;

    try {
      await fetch(`${API_BASE_URL}/api/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          paper: { id, title, url },
          tag,
        }),
      });
      window.dispatchEvent(new Event('paperDeleted'));
    } catch (err) {
      console.error('Failed to update tag:', err);
    }
  };

  return (
    <>
      <div className="block w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 min-h-[140px] flex flex-col justify-between transition hover:shadow-lg">
          <div className="flex items-start mb-2">
            <input
              type="checkbox"
              className="mr-2 mt-1"
              checked={checked}
              onChange={() => onToggle(id)}
            />
            <div className="flex-1">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-gray-900 mb-3 line-clamp-4 hover:underline"
              >
                {title}
              </a>
              <div className="flex justify-between items-end mt-6">
                <button
                  onClick={(e) => { e.stopPropagation(); setOpenTagModal(true); }}
                  className="text-gray-500 hover:text-black text-sm"
                >
                  Edit Tag
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleUnsave(); }}
                  className="text-gray-500 hover:text-red-600 text-sm self-end"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tag selection modal */}
      <TagPickerModal
        open={openTagModal}
        onClose={() => setOpenTagModal(false)}
        onSave={saveWithTag}
      />

      {/* Removed individual card-level generate button */}

      {loading && (
        <div className="text-center mt-4 text-gray-500">Generating plan...</div>
      )}

      {plan && (
        <div className="max-w-3xl mx-auto mt-6 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Your Personalized Plan</h2>
          <ReactMarkdown className="prose">{plan}</ReactMarkdown>
        </div>
      )}
    </>
  );
};


export default SavedPaperCard;