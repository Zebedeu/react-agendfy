import React, { useMemo } from 'react';
import type { ViewPlugin, EventLike } from '@react-agendfy/core';

interface TimelineProps {
  events: EventLike[];
  currentDate: Date;
  onEventClick?: (event: EventLike) => void;
}

const TimelineView: React.FC<TimelineProps> = ({ events, currentDate, onEventClick }) => {
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => 
      new Date(a.start).getTime() - new Date(b.start).getTime()
    );
  }, [events]);

  const groupedByDate = useMemo(() => {
    return sortedEvents.reduce((acc, event) => {
      const date = new Date(event.start).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(event);
      return acc;
    }, {} as Record<string, EventLike[]>);
  }, [sortedEvents]);

  return (
    <div className="timeline-view" role="region" aria-label="Timeline view">
      {Object.entries(groupedByDate).map(([date, dateEvents]) => (
        <div key={date} className="timeline-day">
          <h3>{date}</h3>
          <div className="timeline-events">
            {dateEvents.map(event => (
              <button
                key={event.id}
                onClick={() => onEventClick?.(event)}
                className="timeline-event"
                style={{
                  backgroundColor: event.color || '#f0f0f0',
                  borderLeft: `4px solid ${event.color || '#ccc'}`,
                  margin: '4px 0',
                  padding: '8px',
                  borderRadius: '4px',
                  textAlign: 'left',
                  width: '100%',
                  cursor: 'pointer'
                }}
              >
                <div className="event-title" style={{ fontWeight: 'bold' }}>
                  {event.title}
                </div>
                <div className="event-time" style={{ fontSize: '0.9em' }}>
                  {new Date(event.start).toLocaleTimeString()} - 
                  {new Date(event.end).toLocaleTimeString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const timelineViewPlugin: ViewPlugin = {
  key: 'timeline-view',
  type: 'view',
  viewName: 'timeline',
  component: TimelineView,
  props: { label: 'Timeline' }
};

export default timelineViewPlugin;