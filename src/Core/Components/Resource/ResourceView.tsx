import { format } from 'date-fns';
import React from 'react'
import { ensureDate } from '../../../Utils/DateTrannforms';
import { ResourceIcon } from './ResourceIcon';
 
const ResourceView = ({ resources, events, currentDate }) => {
    return (
      <div className="mt-4 border border-gray-200 rounded-lg bg-white shadow-sm">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <h3 className="font-medium text-gray-700">Visualização por Recurso</h3>
        </div>
        <div className="p-3">
          {resources.map(resource => (
            <div key={resource.id} className="mb-3 last:mb-0">
              <div className="flex items-center mb-1">
                <ResourceIcon resource={resource}           // Assumindo que o ícone vem agora do objeto resource
 />
                <span className="font-medium">{resource.name}</span>
                <span className="text-xs text-gray-500 ml-2">({resource.type})</span>
              </div>
              <div className="pl-6">
                {events
                  .filter(event => 
                    event.resources && 
                    event.resources.some(r => r.id === resource.id)
                  )
                  .map(event => (
                    <div key={event.id} className="text-sm py-1 border-b border-gray-100 last:border-0">
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