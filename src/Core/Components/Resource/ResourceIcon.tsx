import React from 'react'

export const ResourceIcon = ({ resource }) => {
     const getIcon = (type) => {
      switch (type) {
        case 'person':
          return '👤';
        case 'room':
          return '🏢';
        case 'equipment':
          return '🔧';
        default:
          return '📌';
      }
    };
  
    return (
      <span 
        title={`${resource.name} (${resource.type})`}
        className="inline-flex items-center mr-1 text-xs"
      >
        {getIcon(resource.type)}
      </span>
    );
  };