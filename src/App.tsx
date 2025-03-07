import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import Calendar from './Core/Calendar';
import { ToastProvider } from './Core/Components/Toast/Toast';
import { EmailAdapter } from './Utils/EmailAdapter';

const resources = [
  { id: "r1", name: "Sala de Conferência", type: "room" },
  { id: "r2", name: "João Silva", type: "person" },
  { id: "r3", name: "Projetor", type: "equipment" }
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
  resources: [
    { id: "r1", name: "Conference Room", type: "room" },
  ]
},

{
  "id": "10",
  "title": "National Holiday",
  "start": "2025-03-02T06:00:00.000Z",
  "end": "2025-03-02T21:59:59.000Z",
  "color": "#ff9800",
  "isAllDay": false,
  "isMultiDay": true,
  "resources": [
    {
      "id": "r2",
      "name": "João Silva",
      "type": "person"
    }
  ]
},

{
  "id": "3",
  "title": "Annual Conference",
  "start": "2025-03-10T14:00:00.000Z",
  "end": "2025-03-12T15:00:00.000Z",
  "color": "#9c27b0",
  "isAllDay": false,
  "isMultiDay": true,
  resources: [
    { id: "r1", name: "Conference Room", type: "room" },
    { id: "r2", name: "João Silva", type: "person" },
    { id: "r3", name: "João Silva", type: "person" }
  ]
},

{
  "id": "4",
  "title": "Daily Standup",
  "start": "2025-03-01T10:00:00.000Z",
  "end": "2025-03-01T12:15:00.000Z",
  "color": "#4caf50",
  "recurrence": "FREQ=WEEKLY;INTERVAL=1;COUNT=10",
  "isAllDay": false,
  "isMultiDay": false,
},
{
  "id": "5",
  "title": "Carnival",
  "start": "2025-03-01T10:00:00.000Z",
  "end": "2025-03-02T12:15:00.000Z",
  "color": "#a10861",
  "isAllDay": true,
  "isMultiDay": true,
},
{
  "id": "6",
  "title": "Team Lunch",
  "start": "2025-03-05T14:00:00.000Z",
  "end": "2025-03-05T15:00:00.000Z",
  "color": "#ffc107",
  "isAllDay": false,
  "isMultiDay": false,
  alertBefore: 1,
   resources: [
    { id: "r4", name: "Restaurant", type: "location" },
  ]
},
{
  "id": "7",
  "title": "Client Meeting - Project Alpha",
  "start": "2025-03-07T15:00:00.000Z",
  "end": "2025-03-07T16:30:00.000Z",
  "color": "#795548",
  "isAllDay": false,
  "isMultiDay": false,
   resources: [
    { id: "r1", name: "Conference Room", type: "room" },
    { id: "r5", name: "Maria Souza", type: "person" },
  ]
},
 {
  "id": "8",
  "title": "Workshop: React Basics",
  "start": "2025-03-15T09:00:00.000Z",
  "end": "2025-03-15T17:00:00.000Z",
  "color": "#00bcd4",
  "isAllDay": false,
  "isMultiDay": false,
   resources: [
    { id: "r6", name: "Training Room", type: "room" },
  ]
},
{
  "id": "9",
  "title": "Project Beta Sprint Review",
  "start": "2025-03-22T11:00:00.000Z",
  "end": "2025-03-22T12:00:00.000Z",
  "color": "#607d8b",
  "isAllDay": false,
  "isMultiDay": false,
   resources: [
    { id: "r1", name: "Conference Room", type: "room" },
    { id: "r2", name: "João Silva", type: "person" },
    { id: "r5", name: "Maria Souza", type: "person" },
  ]
},
{
  "id": "11",
  "title": "March End Report Deadline",
  "start": "2025-03-31T00:00:00.000Z",
  "end": "2025-03-31T23:59:59.000Z",
  "color": "#f44336",
  "isAllDay": true,
  "isMultiDay": false,
},
{
  "id": "1741282097867",
  "title": "Fomulario",
  "start": "2025-03-06T16:00:00.000Z",
  "end": "2025-03-06T17:00:00.000Z",
  "color": "#cb34a3",
  "isAllDay": false,
  "isMultiDay": false,
  "resources": [
      {
          "id": "r3",
          "name": "Projector",
          "type": "equipment"
      }
  ]
},
{
  "id": "1741289417992",
  "title": "Alerta",
  "start": "2025-03-06T20:30:00.000Z",
  "end": "2025-03-06T21:00:00.000Z",
  "color": "#81909c",
  "isAllDay": false,
  "isMultiDay": false,
  "alertBefore": 18,
  "resources": [
      "r1"
  ]
}
];
function App() {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState(() => {
    // Function to initialize state from localStorage or use initialEvents
    const storedEvents = localStorage.getItem('calendarEvents');
    return storedEvents ? JSON.parse(storedEvents) : initialEvents;
  });
  const [filteredResources, setFilteredResources] = useState([]);

  const defaultConfig = {
    timeZone: 'Africa/Lagos',
    defaultView: "week",
    slotDuration: 15,
    slotLabelFormat: "HH:mm",
    slotMin: "06:00",
    slotMax: "23:59",
    lang: 'en',
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
      enabled: false,          
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
    console.log(updatedEvent)
    console.log("Resized event:", updatedEvent.title);
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

  const myEmailAdapter: EmailAdapter = {
    sendEmail: async (subject, body, recipient) => {
      // Aqui você implementa a lógica para enviar o e-mail usando a biblioteca de sua escolha.
      // Pode ser uma chamada a uma API REST, SMTP, etc.
      console.log("Enviando e-mail:", { subject, body, recipient });
      return Promise.resolve();
    },
  };
  
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
        emailAdapter={myEmailAdapter}
        emailConfig={{ defaultRecipient: "usuario@exemplo.com" }}

      />
    </div>
    </ToastProvider>
  );
}

export default App;