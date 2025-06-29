import React, { useState } from 'react';
import TagPickerModal from './TagPickerModal';

const SavedPaperCard = ({ id, title, url }) => {
  const [openTagModal, setOpenTagModal] = useState(false);

  // -------- Handle Remove --------
  const handleUnsave = async () => {
    const username = localStorage.getItem('username');
    if (!username) return;

    try {
      const res = await fetch('http://localhost:5001/api/unsave', {
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
      await fetch('http://localhost:5001/api/save', {
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
      <div className="bg-slate-50 border border-gray-300 rounded-xl p-4 shadow-sm hover:shadow-md transition">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {title}
        </h3>

        <div className="flex justify-between items-center text-sm">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-900 hover:underline"
          >
            View Paper
          </a>

          <button
            onClick={handleUnsave}
            className="text-gray-500 hover:text-black"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Tag selection modal */}
      <TagPickerModal
        open={openTagModal}
        onClose={() => setOpenTagModal(false)}
        onSave={saveWithTag}
      />
    </>
  );
};

export default SavedPaperCard;