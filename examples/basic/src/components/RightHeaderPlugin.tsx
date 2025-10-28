import { SearchPluginProps } from "@react-agendfy/core";
import { useEffect, useState } from "react";

  const MyRightHeaderPlugin: React.FC<SearchPluginProps> = ({ onSearch, events = [] }) => {
    const [q, setQ] = useState('');
    useEffect(() => {
      const term = q.trim().toLowerCase();
      const results = term.length === 0 ? [] : events.filter(e => (e.title || '').toLowerCase().includes(term));
      onSearch?.(q, results);
    }, [q, events, onSearch]);

    return (
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search..."
        className="react-agenfy-search-input"
        aria-label="Search events"
      />
    );
  };


  export default MyRightHeaderPlugin;
