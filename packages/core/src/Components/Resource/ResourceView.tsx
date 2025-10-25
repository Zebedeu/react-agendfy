import { format } from 'date-fns';
import React from 'react';
import { ensureDate } from '../../Utils/DateTrannforms';
import { ResourceIcon } from './ResourceIcon';
import { EventProps, Resource } from '../../types';

const ResourceView = ({ resources, events, currentDate }: any) => {
  return (
    <div className="react-agenfy-resourceview-container">
      <div className="react-agenfy-resourceview-header">
        <h3 className="react-agenfy-resourceview-header-title">Visualização por Recurso</h3>
      </div>
      <div className="react-agenfy-resourceview-content">
        {resources.map((resource: Resource) => (
          <div key={resource.id} className="react-agenfy-resourceview-item">
            <div className="react-agenfy-resourceview-item-header">
              <ResourceIcon resource={resource} />
              <span className="react-agenfy-resourceview-item-name">{resource.name}</span>
              <span className="react-agenfy-resourceview-item-type">({resource.type})</span>
            </div>
            <div className="react-agenfy-resourceview-item-events">
              {events
                .filter((event: EventProps) => 
                  event.resources && 
                  event.resources.some(r => r.id === resource.id)
                )
                .map((event: EventProps) => (
                  <div key={event.id} className="react-agenfy-resourceview-event">
                    {event.title} - {format(ensureDate(event.start), 'dd/MM HH:mm')} a {format(ensureDate(event.end), 'dd/MM HH:mm')}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceView;
