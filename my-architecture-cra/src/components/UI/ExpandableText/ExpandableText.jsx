import React, { useState } from 'react';
import './ExpandableText.css';

const ExpandableText = ({ text, maxLength = 300 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text || text.length <= maxLength) {
    return <p className="expandable-text">{text}</p>;
  }

  const truncatedText = text.slice(0, maxLength) + '...';

  return (
    <div className="expandable-text-container">
      <p className="expandable-text">
        {isExpanded ? text : truncatedText}
      </p>
      <button 
        className="read-more-btn"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'Свернуть' : 'Читать больше'}
      </button>
    </div>
  );
};

export default ExpandableText;