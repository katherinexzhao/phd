import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TagPickerModal from './TagPickerModal';

const PaperCard = ({ id, title, summary, fullSummary, url, coverUrl }) => {
  const [expanded, setExpanded] = useState(false);
  const [openTagModal, setOpenTagModal] = useState(false);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [newTag, setNewTag] = useState('');
  const navigate = useNavigate();

  // Load existing tags when modal opens
  useEffect(() => {
    if (!openTagModal) return;
    const username = localStorage.getItem('username');
    fetch(`/api/tags?username=${username}`)
      .then(res => res.json())
      .then(data => setTags(data || []))
      .catch(() => setTags([]));
  }, [openTagModal]);

  const openModal = () => setOpenTagModal(true);
  const closeModal = () => setOpenTagModal(false);

  const saveWithTag = async (tag) => {
    closeModal();
    const username = localStorage.getItem('username');
    if (!username) {
      alert('Please log in first.');
      return;
    }
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, paper: { id, title, url }, tag }),
      });
      if (res.ok) {
        alert('✅ Saved with tag!');
      } else {
        alert('❌ Save failed.');
      }
    } catch {
      alert('❌ Error saving paper.');
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border p-6 shadow-md hover:shadow-xl transition-all duration-300">
        {coverUrl && (
          <img
            src={coverUrl}
            alt="Cover"
            className="w-full h-48 object-cover rounded-lg mb-4"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'; }}
          />
        )}
        <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-indigo-700 transition">
          {title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{summary}</p>
        {expanded && (
          <div className="bg-gray-50 p-3 rounded-md text-gray-700 text-sm">
            <p>{fullSummary}</p>
          </div>
        )}
        <div className="flex justify-between items-center mt-4">
          <a href={url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center">
            📄 View PDF
          </a>
          <button onClick={() => setExpanded(!expanded)} className="text-sm text-indigo-600 hover:underline">
            {expanded ? 'Collapse' : 'Read More'}
          </button>
          <button onClick={openModal} className="text-sm text-green-600 hover:underline">
            💾 Save
          </button>
        </div>
      </div>

      <TagPickerModal
        open={openTagModal}
        onClose={closeModal}
        onSave={saveWithTag}
      />
    </>
  );
};

export default PaperCard;
