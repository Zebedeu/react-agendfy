import React, { useState, useEffect, useRef, useCallback, useMemo, FC } from "react";
import { format, roundToNearestHours } from "date-fns";
import {TZDate} from '@date-fns/tz'
import { Calendar, Resource } from "@react-agendfy/core";
import darkThemePlugin from "@react-agendfy/plugin-theme";
import EventFormModal from "./components/EventFormModal";
import ErrorBoundary from "./components/ErrorBoundary";
import MyRightHeaderPlugin from "./components/RightHeaderPlugin";
import  exportsPlugin from '@react-agendfy/plugin-export-reports'
import resourceFilterPlugin from "@react-agendfy/plugin-filter";
import { v6 } from "uuid";

class ExampleEmailAdapter {
  send(emailConfig: any) {
    console.log("Enviando email com config:", emailConfig);
  }
}

const resources = [
  { id: "r1", name: "Conference Room", type: "room" },
  { id: "r2", name: "John Silva", type: "person" },
  { id: "r3", name: "Projector", type: "equipment" },
  { id: "r4", name: "Holidays", type: "equipment" },
];

const initialEvents = [
  {
    id: "11",
    title: "March End Report Deadline",
    start: "2025-03-31T00:00:00.000Z",
    end: "2025-10-31T23:59:59.000Z",
    color: "#f44336",
    isAllDay: true,
    isMultiDay: true,
  },
   {
    id: "12",
    title: "teste",
    start: "2025-10-26T14:00:00.000Z",
    end: "2025-10-26T15:00:00.000Z",
    color: "#055f69",
    isAllDay: false,
    isMultiDay: false,
  },
];

const App: FC = () => {
  const calendarRef = useRef<HTMLDivElement>(null);
  const justUpdatedEvent = useRef(false);

  const [events, setEvents] = useState<any[]>(() => {
    const storedEvents = localStorage.getItem("anys");
    return storedEvents ? JSON.parse(storedEvents) : initialEvents;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventData, setNewEventData] = useState<any>(null);
  const [filteredResources, setFilteredResources] = useState<string[]>([]);
  const [theme, setTheme] = useState<string>(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    localStorage.setItem("anys", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === "light" ? "dark" : "light"));

  const defaultConfig = useMemo(() => ({
    timeZone: "Africa/Lagos",
    defaultView: "week",
    slotDuration: 15,
    slotLabelFormat: "HH:mm",
    slotMin: "00:00",
    slotMax: "23:59",
    lang: "en",
    today: "Today",
    monthView: "Month",
    weekView: "Week",
    dayView: "Day",
    listView: "List",
    all_day: "All Day",
    clear_filter: "Clear Filters",
    filter_resources: "Filter Resources",
    businessHours: {
      enabled: true,
      intervals: [
        { daysOfWeek: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "17:00" },
      ],
    },
    alerts: { enabled: true, thresholdMinutes: 2 },
    export: true,
    calendar_export: "Export",
  }), []);

  const handleEventUpdate = useCallback((updatedEvent: any) => {
    setEvents(events.map(event => event.id === updatedEvent.id ? updatedEvent : event));
    justUpdatedEvent.current = true;
    setTimeout(() => {
      justUpdatedEvent.current = false;
    }, 100);
  }, [events]);

  const handleOpenModal = useCallback((data: any) => {
    if (justUpdatedEvent.current) return;
    
    // Para cliques em dias ou slots, define um 'end' padrão de 1 hora depois.
    if (data instanceof Date) {
      setNewEventData({
        start: data.toISOString(),
        end: new Date(data.getTime() + 60 * 60 * 1000).toISOString(),
      });
    } else {
      // Para cliques em eventos existentes ou seleção de range
      setNewEventData(data);
    }
    setIsModalOpen(true);
  }, []);

  const handleSaveEvent = useCallback((eventData: any) => {
    if (eventData.id) {
      setEvents(prevEvents => prevEvents.map(ev => ev.id === eventData.id ? eventData : ev));
    } else {
      const newEventWithId = {
        ...eventData,
        id: v6(),
      };
      setEvents(prevEvents => [...prevEvents, newEventWithId]);
    }
    setNewEventData(null);
    setIsModalOpen(false);
  }, []);

  const handleResourceFilterChange = useCallback((selected: string[]) => {
    setFilteredResources(selected);
  }, []);

  const MyLeftHeaderPlugin: FC = () => (
    <button className="react-agendfy-btn" onClick={toggleTheme}>
      {theme === "light" ? "Dark Mode" : "Light Mode"}
    </button>
  );

  const MyCustomView: FC<any> = ({ events }) => (
    <div>My customized view ({events.length} events)</div>
  );

  return (
    <ErrorBoundary>
      <div style={{width: "100%", height: 'auto', display: "flex", flexDirection: "column"}}>
        <Calendar 
          ref={calendarRef}
          events={events}
          config={defaultConfig}
          onEventUpdate={handleEventUpdate}
          onEventResize={handleEventUpdate}
          onEventClick={handleOpenModal}
          onDayClick={handleOpenModal}
          onSlotClick={handleOpenModal}
          resources={resources}
          onDateRangeSelect={handleOpenModal}
          filteredResources={filteredResources}
          onResourceFilterChange={handleResourceFilterChange}
          emailAdapter={new ExampleEmailAdapter()}
          emailConfig={{ defaultRecipient: "user@example.com" }}
          theme={theme}
          plugins={[
           { location: "left", type: "filter", component: MyLeftHeaderPlugin },
           { ...resourceFilterPlugin, location: "left" },
         { location: "right", type: "search", component: MyRightHeaderPlugin },
           { type: "view", viewName: "custom view", component: MyCustomView },
            darkThemePlugin,
            exportsPlugin
          ]}
        />
        <EventFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSaveEvent}
          eventData={newEventData}
          config={defaultConfig}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;