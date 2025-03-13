import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import Calendar from './Core/Calendar';
import { ToastProvider } from './Core/Components/Toast/Toast';
import { EmailAdapter } from './types';

export class ExampleEmailAdapter implements EmailAdapter {
  async sendEmail(subject: string, body: string, recipient?: string): Promise<void> {
    // Aqui você integra com o seu serviço de e-mail real.
    console.log(`Enviando e-mail para ${recipient}: ${subject} - ${body}`);
    return Promise.resolve();
  }
}
const resources = [
  { id: "r1", name: "Sala de Conferência", type: "room" },
  { id: "r2", name: "João Silva", type: "person" },
  { id: "r3", name: "Projetor", type: "equipment" },
  { id: "r4", name: "Feriados", type: "equipment" }
];


const initialEvents = [
  {
      "id": "1",
      "title": "Planning Meeting",
      "start": "2025-03-01T09:00:00.000Z",
      "end": "2025-03-01T10:00:00.000Z",
      "color": "#3490dc",
      "isAllDay": false,
      "isMultiDay": false,
      "resources": [
          {
              "id": "r1",
              "name": "Conference Room",
              "type": "room"
          }
      ]
  },

  {
      "id": "1741364887622",
      "title": "10 horas",
      "start": "2025-03-13T12:00:00.000Z",
      "end": "2025-03-13T13:00:00.000Z",
      "color": "#3490dc",
      "isAllDay": false,
      "isMultiDay": false,
      "alertBefore": 28,
      "resources": [
          "r1",
      ]
  }
]
function App() {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState(() => {
    // Function to initialize state from localStorage or use initialEvents
    const storedEvents = localStorage.getItem('calendarEvents');
    return storedEvents ? JSON.parse(storedEvents) : initialEvents;
  });
  const [filteredResources, setFilteredResources] = useState([]);

  const defaultConfig = {
    timeZone: 'UTC',
    defaultView: "week",
    slotDuration: 15,
    slotLabelFormat: "HH:mm",
    slotMin: "06:00",
    slotMax: "23:59",
    lang: 'pt',
    today: 'Today',
    monthView: 'Month',
    weekView: 'Week',
    dayView: 'Day',
    listView: 'List',
    all_day: 'All Day',
    clear_filter: 'Clear Filters',
    filter_resources: 'Filter Resources',
    businessHours: {
      enabled: true,
      intervals: [
        { daysOfWeek: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "17:00" }
      ]
    },
    
    alerts: {
      enabled: true,          
      thresholdMinutes: 15,  
    },
  };

  

  // Save events to localStorage whenever events state changes
  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);


  const handleEventUpdate = useCallback((updatedEvent) => {
    console.log("Updated event:", updatedEvent);
    // Assuming onEventUpdate in Calendar component expects the updated event to replace the old one
    // You might need to adjust this logic based on how your Calendar component handles updates
    const updatedEventsList = events.map(event =>
      event.id === updatedEvent.id ? updatedEvent : event
    );
    setEvents(updatedEventsList);
  }, [events, setEvents]);


  const handleResizedUpdate = useCallback((updatedEvent) => {
    console.log("Resized event:", updatedEvent);
    // Assuming onEventUpdate in Calendar component expects the updated event to replace the old one
    // You might need to adjust this logic based on how your Calendar component handles updates
    const updatedEventsList = events.map(event =>
      event.id === updatedEvent.id ? updatedEvent : event
    );
    setEvents(updatedEventsList);
  }, [events, setEvents]);

  
  const handleEventClick = useCallback((event) => {
    console.log("Clicked event:", event);
  }, []);

  const handleDayClick = useCallback((dayDate) => {
    console.log("Clicked day:", dayDate);
    alert(`Clicked day: ${format(dayDate, 'dd/MM/yyyy')}`);
  }, []);

  const handleSlotClick = useCallback((slotTime) => {
    console.log("Clicked slot:", slotTime);
    alert(`Clicked slot: ${format(slotTime, 'HH:mm dd/MM/yyyy')}. You can add a new event here.`);
  }, []);


  const handleResourceFilterChange = useCallback((selectedResources: string[]) => {
    setFilteredResources(selectedResources);
  }, []);

 
  return (
    <ToastProvider>
    <div className="">
      <Calendar
        events={events}
        config={defaultConfig}
       onEventUpdate={handleEventUpdate}
        onEventClick={handleEventClick}
        onDayClick={handleDayClick}
        onSlotClick={handleSlotClick}
        resources={resources}
        onEventResize={handleResizedUpdate}
        filteredResources={filteredResources}
        onResourceFilterChange={handleResourceFilterChange}
        emailAdapter={new ExampleEmailAdapter()} // Injeção do adaptador de e-mail
        emailConfig={{ defaultRecipient: "usuario@exemplo.com" }}

      />
    </div>
    </ToastProvider>
  );
}

export default App;