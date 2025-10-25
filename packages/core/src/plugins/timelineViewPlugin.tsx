import React from 'react';
import type { EventLike } from '../types/plugins';

/**
 * Timeline view plugin — componente simples, responsivo e acessível.
 * Pode ser substituído por implementação com virtualização / interação no futuro.
 */
const TimelineView: React.FC<{ events?: EventLike[]; onEventClick?: (e: EventLike) => void }> = ({ events = [], onEventClick }) => {
  return (
    <div aria-label="Timeline view" style={{ padding: 12 }}>
      <h3 style={{ marginTop: 0 }}>Timeline</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {events.map(ev => (
          <li key={ev.id} style={{ marginBottom: 8 }}>
            <button
              onClick={() => onEventClick?.(ev)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.06)',
                background: ev.color ?? 'var(--color-bg-white)',
                cursor: 'pointer'
              }}
              aria-label={`Open event ${ev.title}`}
            >
              <div style={{ fontWeight: 600 }}>{ev.title}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-gray-500)' }}>
                {String(ev.start)} → {String(ev.end)}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const timelineViewPlugin = {
  key: 'timeline-view-plugin',
  type: 'view',
  viewName: 'timeline',
  component: TimelineView,
  props: { label: 'Timeline' },
};

export default timelineViewPlugin;