// plugins/EventTitleFilterPlugin.tsx
import React, { useState, useCallback } from 'react';
import { FilterPluginProps, EventProps, CalendarConfig } from '../types';

interface EventTitleFilterProps extends FilterPluginProps {
  // You can add any specific props for this filter if needed
}

const EventTitleFilterPlugin: React.FC<EventTitleFilterProps> = ({ events, onFilterChange, config }) => {
  const [filterText, setFilterText] = useState('');
  console.log("EventTitleFilterPlugin Rendered");

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value.toLowerCase();
    setFilterText(text);
    const filteredEvents = events.filter(event =>
      event.title.toLowerCase().includes(text)
    );
    onFilterChange(filteredEvents);
  }, [events, onFilterChange]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
      <label htmlFor="titleFilter" style={{ marginRight: '5px' }}>
        {config.filter_resources}: {/* Reutilizando o rótulo existente para filtro */}
      </label>
      <input
        type="text"
        id="titleFilter"
        value={filterText}
        onChange={handleInputChange}
        placeholder="Filtrar por título"
        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
    </div>
  );
};

export default EventTitleFilterPlugin;