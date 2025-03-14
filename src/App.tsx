import React, { useMemo, useRef, useState, useEffect, useCallback, FC } from 'react';
import { format } from 'date-fns';
import Calendar from './Core/Calendar';
import { ToastProvider } from './Core/Components/Toast/Toast';
import { EmailAdapter } from './types/Notification';

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
      "id": "10",
      "title": "National Holiday",
      "start": "2025-03-03T07:00:00.000+01:00",
      "end": "2025-03-05T22:59:59.000+01:00",
      "color": "#ff9800",
      "isAllDay": false,
      "isMultiDay": true,
      "resources": [
          {
              "id": "r2",
              "name": "João Silva",
              "type": "person"
          }
      ],
      "recurrence": ""
  },
  {
      "id": "3",
      "title": "Annual Conference",
      "start": "2025-03-10T14:00:00.000Z",
      "end": "2025-03-12T15:00:00.000Z",
      "color": "#9c27b0",
      "isAllDay": false,
      "isMultiDay": true,
      "resources": [
          {
              "id": "r1",
              "name": "Conference Room",
              "type": "room"
          },
          {
              "id": "r2",
              "name": "João Silva",
              "type": "person"
          },
          {
              "id": "r3",
              "name": "João Silva",
              "type": "person"
          }
      ]
  },
  {
      "id": "4",
      "title": "Daily Standup",
      "start": "2025-03-06T09:00:00.000+01:00",
      "end": "2025-03-06T11:15:00.000+01:00",
      "color": "#4caf50",
      "recurrence": "FREQ=WEEKLY;INTERVAL=1;COUNT=10",
      "isAllDay": false,
      "isMultiDay": false,
      "resources": [
          {
              "id": "default",
              "name": "Geral"
          }
      ]
  },
  {
      "id": "5",
      "title": "Carnival",
      "start": "2025-03-01T10:00:00.000Z",
      "end": "2025-03-02T12:15:00.000Z",
      "color": "#a10861",
      "isAllDay": true,
      "isMultiDay": true
  },
  {
      "id": "6",
      "title": "Team Lunch",
      "start": "2025-03-13 06:00:00",
      "end": "2025-03-14 07:00:00",
      "color": "#ffc107",
      "isAllDay": false,
      "isMultiDay": true,
      "alertBefore": 1,
      "resources": [
          {
              "id": "r4",
              "name": "Restaurant",
              "type": "location"
          }
      ],
      "recurrence": ""
  },
  {
      "id": "7",
      "title": "Client Meeting - Project Alpha",
      "start": "2025-03-07T15:00:00.000+01:00",
      "end": "2025-03-07T16:30:00.000+01:00",
      "color": "#795548",
      "isAllDay": false,
      "isMultiDay": false,
      "resources": [
          {
              "id": "r1",
              "name": "Conference Room",
              "type": "room"
          },
          {
              "id": "r5",
              "name": "Maria Souza",
              "type": "person"
          }
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
      "resources": [
          {
              "id": "r6",
              "name": "Training Room",
              "type": "room"
          }
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
      "resources": [
          {
              "id": "r1",
              "name": "Conference Room",
              "type": "room"
          },
          {
              "id": "r2",
              "name": "João Silva",
              "type": "person"
          },
          {
              "id": "r5",
              "name": "Maria Souza",
              "type": "person"
          }
      ]
  },
  {
      "id": "11",
      "title": "March End Report Deadline",
      "start": "2025-03-31T00:00:00.000Z",
      "end": "2025-03-31T23:59:59.000Z",
      "color": "#f44336",
      "isAllDay": true,
      "isMultiDay": false
  },
  {
      "id": "1741282491943",
      "title": "Teste",
      "start": "2025-03-06T17:34:00.000Z",
      "end": "2025-03-06T19:34:00.000Z",
      "color": "#931081",
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
      "id": "1741285313646",
      "title": "Berta",
      "start": "2025-03-19 12:30:00",
      "end": "2025-03-19 13:30:00",
      "color": "#a253b2",
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
      "id": "1741285817576",
      "title": "zebedeu",
      "start": "2025-03-04T16:00:00.000+01:00",
      "end": "2025-03-05T17:00:00.000+01:00",
      "color": "#e01515",
      "isAllDay": false,
      "isMultiDay": true,
      "resources": [
          {
              "id": "r3",
              "name": "Projector",
              "type": "equipment"
          }
      ],
      "recurrence": ""
  },
  {
      "id": "1741288355810",
      "title": "Nejo",
      "start": "2025-03-06 22:00:00",
      "end": "2025-03-22 22:00:00",
      "color": "#3490dc",
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
      "start": "2025-03-07T20:30:00.000+01:00",
      "end": "2025-03-07T21:00:00.000+01:00",
      "color": "#81909c",
      "isAllDay": false,
      "isMultiDay": false,
      "alertBefore": 18,
      "resources": [
          "r1"
      ]
  },
  {
      "id": "1741342029168",
      "title": "teste 2",
      "start": "2025-03-07T02:30:00.000+01:00",
      "end": "2025-03-07T03:30:00.000+01:00",
      "color": "#f10909",
      "isAllDay": false,
      "isMultiDay": false,
      "alertBefore": 7,
      "resources": [
          "r1"
      ]
  },
  {
      "id": "1741361195389",
      "title": "familia",
      "start": "2025-03-07T16:26:00.000Z",
      "end": "2025-03-07T17:26:00.000Z",
      "color": "#f5eea8",
      "isAllDay": false,
      "isMultiDay": false,
      "alertBefore": 0,
      "resources": [
          "r2",
          "r1",
          "r3",
          "r4"
      ]
  },
  {
      "id": "1741361390974",
      "title": "bbbbbbbb",
      "start": "2025-03-07T17:00:00.000Z",
      "end": "2025-03-07T18:00:00.000Z",
      "color": "#57dc32",
      "isAllDay": false,
      "isMultiDay": false,
      "alertBefore": 0,
      "resources": [
          "r3",
          "r1",
          "r2",
          "r4"
      ]
  },
  {
      "id": "1741364887622",
      "title": "10 horas",
      "start": "2025-03-07T09:00:00.000Z",
      "end": "2025-03-07T10:00:00.000Z",
      "color": "#3490dc",
      "isAllDay": false,
      "isMultiDay": false,
      "alertBefore": 0,
      "resources": [
          "r1",
          "r2",
          "r4"
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
    timeZone: 'Africa/Lagos',
    defaultView: "month",
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
    export: true,
    calendar_export: 'exportar'
  };

  
const config = useMemo(()=> {
    return defaultConfig;
}, [])
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

  const myEmailAdapter: EmailAdapter = {
    sendEmail: async (subject, body, recipient) => {
      // Aqui você implementa a lógica para enviar o e-mail usando a biblioteca de sua escolha.
      // Pode ser uma chamada a uma API REST, SMTP, etc.
      console.log("Enviando e-mail:", { subject, body, recipient });
      return Promise.resolve();
    },
  };

  const MyLeftHeaderPlugin: React.FC = () => <button>Plugin Esquerdo</button>;
  const MyRightHeaderPlugin: React.FC = () => <input type="text" placeholder="Pesquisar" />;
  const MyCustomViewComponent: React.FC<any> = ({ events }) => {

    return (
      <div>Minha Visualização Customizada!</div>
    )
  };
  

  return (
    <ToastProvider>
    <div className="">
      <Calendar
        events={events}
        config={{ ...config }}
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
        plugins={[
          { location: 'left', type:'header',  component: MyLeftHeaderPlugin, key: 'left-plugin' },
          { location: 'right',type:'header', component: MyRightHeaderPlugin, props: { className: 'search-input' }, key: 'right-plugin' },
          { location: 'view', type:'header', viewName: 'custom view', component: MyCustomViewComponent, key: 'custom-view-key' },
          { location: 'view', type:'header', viewName: 'notas', component: MyCustomView, key: 'custom-nota-key' },
        ]}       

      />
    </div>
    </ToastProvider>
  );
}

const MyCustomView: FC<any> = ({ events, currentDate, config, onEventClick }) => (
  <div>oiiii </div>
);

export default App;