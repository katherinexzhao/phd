import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from "../api";

export default function TagPickerModal({ open, onClose, onSave }) {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [selected, setSelected] = useState('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!open) return;
    const username = localStorage.getItem('username');
    fetch(`${API_BASE_URL}/api/tags?username=${username}`)
      .then(res => res.json())
      .then(data => setTags(data || []))
      .catch(() => setTags([]));
  }, [open]);

  const toggleEdit = () => setEditMode(prev => !prev);

  const choose = tag => setSelected(tag);
  const confirm = () => {
    const tag = newTag.trim() || selected;
    if (tag) onSave(tag);
  };

  const deleteTag = async tag => {
    const username = localStorage.getItem('username');
    try {
      const res = await fetch(`${API_BASE_URL}/api/tag`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, tag }),
      });
      if (res.ok) setTags(prev => prev.filter(t => t !== tag));
    } catch (err) {
      console.error('Failed to delete tag:', err);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Choose a tag</h2>
          <button
            onClick={toggleEdit}
            className="text-sm text-blue-600 hover:underline"
          >
            {editMode ? 'Done' : 'Edit'}
          </button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map(t => (
              <div key={t} className="relative">
                <button
                  onClick={() => choose(t)}
                  className={`px-3 py-1 rounded-full border cursor-pointer ${
                    selected === t
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700'
                  }`}
                >
                  #{t}
                </button>
                {editMode && (
                  <button
                    onClick={e => { e.stopPropagation(); deleteTag(t); }}
                    className="absolute -top-1 -right-1 w-5 h-5 text-gray-500 hover:text-gray-700 transition"
                    title="Delete tag"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <input
          value={newTag}
          onChange={e => setNewTag(e.target.value)}
          placeholder="Or type new tag"
          className="w-full border px-3 py-2 rounded mb-4"
        />

        <div className="text-right space-x-2">
          <button onClick={onClose} className="px-4 py-1 rounded bg-gray-200">Cancel</button>
          <button onClick={confirm} className="px-4 py-1 rounded bg-blue-600 text-white">Save</button>
        </div>
      </div>
    </div>
  );
}
