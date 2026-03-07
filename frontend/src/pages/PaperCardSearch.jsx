import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TagPickerModal from './TagPickerModal';

console.log("✅ Loaded PaperCardSearch component");

const PaperCard = ({ id, title, summary, fullSummary, url, coverUrl }) => {
  const [expanded, setExpanded] = useState(false);
  const [openTagModal, setOpenTagModal] = useState(false);
  const [tags, setTags] = useState([]);
  const [openForwardModal, setOpenForwardModal] = useState(false);
  const [forwardComment, setForwardComment] = useState('');
  const navigate = useNavigate();
  const [forwardTags, setForwardTags] = useState([]);

  // Load existing tags when modal opens
  useEffect(() => {
    if (!openTagModal) return;
    const username = localStorage.getItem('username');
    fetch(`/api/tags?username=${username}`)
      .then(res => res.json())
      .then(data => setTags(data || []))
      .catch(() => setTags([]));
  }, [openTagModal]);

  useEffect(() => {
    if (!openForwardModal) return;
    const username = localStorage.getItem('username');
    fetch(`/api/tags?username=${username}`)
      .then(res => res.json())
      .then(data => setTags(data || []))
      .catch(() => setTags([]));
  }, [openForwardModal]);

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

  const handleForward = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return alert('Please log in');

    const newPost = {
      title: title || 'Untitled',
      description: fullSummary || '',
      coverUrl: coverUrl || '',
      tags: forwardTags || [],
      resourceUrl: url || '',
      uploader: userId,
      isForwarded: true,
      originalSource: url || '',
      comment: forwardComment
    };

    try {
      const res = await fetch('http://localhost:5001/api/oer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });

      if (res.ok) {
        alert('✅ Successfully forwarded to Community!');
        setOpenForwardModal(false);
        setForwardComment('');
        setForwardTags([]);
        setTags([]);
      } else {
        alert('❌ Failed to forward.');
      }
    } catch (err) {
      alert('❌ Server error.');
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
        <div className="flex justify-between items-center mt-4 space-x-2 flex-wrap">
          <a href={url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center">
            📄 View PDF
          </a>
          <button onClick={() => setExpanded(!expanded)} className="text-sm text-indigo-600 hover:underline">
            {expanded ? 'Collapse' : 'Read More'}
          </button>
          <button onClick={openModal} className="text-sm text-green-600 hover:underline">
            💾 Save
          </button>
          <button onClick={() => setOpenForwardModal(true)} className="text-sm text-purple-600 hover:underline">
            🔁 Forward
          </button>
        </div>
      </div>

      {openForwardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-96">
            <h3 className="text-lg font-bold mb-3">Add a comment before forwarding:</h3>
            <textarea
              value={forwardComment}
              onChange={(e) => setForwardComment(e.target.value)}
              placeholder="Write your comment..."
              className="w-full p-2 border rounded-md mb-4"
              rows={4}
            />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select tags:</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (forwardTags.includes(tag)) {
                        setForwardTags(forwardTags.filter(t => t !== tag));
                      } else {
                        setForwardTags([...forwardTags, tag]);
                      }
                    }}
                    className={`px-2 py-1 rounded-md text-sm border ${
                      forwardTags.includes(tag) ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setOpenForwardModal(false)}
                className="px-4 py-2 text-gray-700 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleForward}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Forward
              </button>
            </div>
          </div>
        </div>
      )}

      <TagPickerModal
        open={openTagModal}
        onClose={closeModal}
        onSave={saveWithTag}
      />
    </>
  );
};

export default PaperCard;