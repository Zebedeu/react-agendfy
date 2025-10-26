import React, { useMemo } from 'react';
import type { EventLike, ViewPlugin, Resource } from '@react-agendfy/core';
import './TimelineView.css';
interface TimelineProps {
  events: EventLike[];
  resources?: Resource[];
  currentDate: Date;
  onEventClick?: (event: EventLike) => void;
}

const ResourceRow: React.FC<{
  resource: Resource;
  eventsByResource: Record<string, EventLike[]>;
  onEventClick?: (event: EventLike) => void;
  level: number;
}> = ({ resource, eventsByResource, onEventClick, level }) => {
  const resourceEvents = (eventsByResource[resource.id] || []).sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  return (
    <>
      <div className="ag-timeline-resource-row" role="row" style={{ backgroundColor: `rgba(0,0,0,${level * 0.03})` }}>
        <div className="ag-timeline-resource-header" role="rowheader" style={{ paddingLeft: `${level * 20 + 10}px` }}>
          {resource.children && resource.children.length > 0 && <span className="ag-resource-toggle">▼</span>}
          {resource.title}
        </div>
        <div className="ag-timeline-events-lane" role="gridcell">
          {resourceEvents.map(event => (
            <button
              key={event.id}
              onClick={() => onEventClick?.(event)}
              className="ag-timeline-event"
              aria-label={`Event: ${event.title}`}
              style={{
                backgroundColor: event.color || 'var(--ag-event-bg-color, #e0eaff)',
                borderLeft: `4px solid ${event.color || 'var(--ag-event-border-color, #5a8def)'}`,
              }}
            >
              <div className="ag-event-title">{event.title}</div>
              <div className="ag-event-time">
                {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                {event.end && new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Renderiza os filhos recursivamente */}
      {resource.children?.map(child => (
        <ResourceRow
          key={child.id}
          resource={child}
          eventsByResource={eventsByResource}
          onEventClick={onEventClick}
          level={level + 1}
        />
      ))}
    </>
  );
};

const TimelineView: React.FC<TimelineProps> = ({
  events,
  resources = [],
  currentDate,
  onEventClick,
}) => {
   const eventsByResource = useMemo(() => {
    const map: Record<string, EventLike[]> = {};

    for (const event of events) {
      const targetResourceIds = event.resourceIds || (event.resourceId ? [event.resourceId] : ['unassigned']);
      for (const id of targetResourceIds) {
        if (!map[id]) {
          map[id] = [];
        }
        map[id].push(event);
      }
    }
    return map;
  }, [events]);

   const resourcesToRender = useMemo(() => {
    const renderedResources: Resource[] = [...resources];
    if (eventsByResource.unassigned) {
      renderedResources.push({
        id: 'unassigned',
        title: 'Unassigned',
      });
    }
    return renderedResources;
  }, [resources, eventsByResource]);

  return (
    <div className="ag-timeline-view" role="grid" aria-label="Resource Timeline">
      {resourcesToRender.map(resource => (
        <ResourceRow
          key={resource.id}
          resource={resource}
          eventsByResource={eventsByResource}
          onEventClick={onEventClick}
          level={0}
        />
      ))}
      {resourcesToRender.length === 0 && (
        <div className="ag-timeline-empty">
          <p>No resources to display.</p>
        </div>
      )}
    </div>
  );
};

const timelineViewPlugin: ViewPlugin = {
  key: 'timeline-view',
  type: 'view',
  viewName: 'timeline',
  component: TimelineView,
  props: { label: 'Timeline' },
};

export default timelineViewPlugin;