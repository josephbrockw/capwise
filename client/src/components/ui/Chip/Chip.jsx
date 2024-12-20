import React from 'react';
import './Chip.css';

const Chip = ({ label, onDelete }) => {
  return (
    <div className="chip">
      <span className="chip-label">{label}</span>
      {onDelete && (
        <button onClick={onDelete} className="chip-delete" aria-label="Remove">
          ×
        </button>
      )}
    </div>
  );
};

export default Chip;
