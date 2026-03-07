// src/components/SelectAllControls.jsx
import React from 'react';

const SelectAllControls = ({ onSelectAll, onDeselectAll }) => {
    console.log('✅ SelectAllControls mounted');
  <div className="space-x-2">
    <button
      onClick={onSelectAll}
      className="text-sm text-blue-600 hover:underline"
    >
      Select All
    </button>
    <button
      onClick={onDeselectAll}
      className="text-sm text-gray-500 hover:underline"
    >
      Deselect All
    </button>
  </div>
};

export default SelectAllControls;