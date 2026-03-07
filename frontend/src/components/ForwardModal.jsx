// src/components/ForwardModal.jsx
import React, { useState } from 'react';

const ForwardModal = ({ open, onClose, onSubmit }) => {
  const [comment, setComment] = useState('');

  if (!open) return null;

  const handleSubmit = () => {
    onSubmit(comment);
    setComment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Add a Comment</h2>
        <textarea
          className="w-full border border-gray-300 rounded p-2 mb-4"
          rows={4}
          placeholder="Why are you forwarding this?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="text-gray-600 hover:underline">Cancel</button>
          <button onClick={handleSubmit} className="bg-purple-600 text-white px-4 py-1 rounded">Forward</button>
        </div>
      </div>
    </div>
  );
};

export default ForwardModal;