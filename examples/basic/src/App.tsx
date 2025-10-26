
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  FC,
  Suspense,
} from "react";
import { format } from "date-fns";
import { Calendar } from "@react-agendfy/core";
import ErrorBoundary from "./components/ErrorBoundary";

// Plugins
import exportPdfPlugin from "@react-agendfy/plugin-export-pdf";
import reportsExportPlugin from "@react-agendfy/plugin-export-reports";
import darkThemePlugin from "@react-agendfy/plugin-theme";
import timelineViewPlugin from "@react-agendfy/plugin-timeline";
import googleCalendarPlugin from "@react-agendfy/plugin-google-calendar";

// Exemplo de adaptador de email
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
    title: "Daily Standup Meeting",
    start: "2025-10-23T10:00:00.000Z",
    end: "2025-10-23T10:30:00.000Z",
    color: "#2196f3",
    isAllDay: false,
    isMultiDay: false,
  },
  {
    id: "13",
    title: "Annual Planning Session (2026 Budget)",
    start: "2025-12-15T00:00:00.000Z",
    end: "2025-12-17T23:59:59.000Z",
    color: "#673ab7",
    isAllDay: true,
    isMultiDay: true,
  },
  {
    id: "14",
    title: "Q4 Performance Review",
    start: "2025-11-05T14:00:00.000Z",
    end: "2025-11-05T17:00:00.000Z",
    color: "#4caf50",
    isAllDay: false,
    isMultiDay: false,
  },
  {
    id: "15",
    title: "Company Holiday Break",
    start: "2026-01-01T00:00:00.000Z",
    end: "2026-01-10T23:59:59.000Z",
    color: "#ffc107",
    isAllDay: true,
    isMultiDay: true,
  },
  {
    id: "16",
    title: "Project Alpha Code Freeze",
    start: "2026-02-14T00:00:00.000Z",
    end: "2026-02-14T23:59:59.000Z",
    color: "#ff9800",
    isAllDay: true,
    isMultiDay: false,
  },
  {
    id: "17",
    title: "Technical Workshop - New Framework",
    start: "2025-11-10T00:00:00.000Z",
    end: "2025-11-10T23:59:59.000Z",
    color: "#009688",
    isAllDay: true,
    isMultiDay: false,
  },
  {
    id: "18",
    title: "Team Lunch Celebration",
    start: "2025-11-20T12:30:00.000Z",
    end: "2025-11-20T13:30:00.000Z",
    color: "#e91e63",
    isAllDay: false,
    isMultiDay: false,
  },
  {
    id: "19",
    title: "Mandatory Security Training",
    start: "2026-03-01T00:00:00.000Z",
    end: "2026-03-01T23:59:59.000Z",
    color: "#3f51b5",
    isAllDay: true,
    isMultiDay: false,
  },
];

function App() {
  const calendarRef = useRef<HTMLDivElement>(null);

  const [events, setEvents] = useState<any[]>(() => {
    const storedEvents = localStorage.getItem("anys");
    return storedEvents ? JSON.parse(storedEvents) : initialEvents;
  });

  const [filteredResources, setFilteredResources] = useState<string[]>([]);

  const defaultConfig = useMemo(
    () => ({
      timeZone: "Africa/Lagos",
      defaultView: "week",
      slotDuration: 15,
      slotLabelFormat: "HH:mm",
      slotMin: "08:00",
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
      alerts: { enabled: true, thresholdMinutes: 15 },
      export: true,
      calendar_export: "Export",
    }),
    []
  );

  useEffect(() => {
    localStorage.setItem("anys", JSON.stringify(events));
  }, [events]);

  const handleEventUpdate = useCallback((updatedEvent: any) => {
    console.log("Updated event:", updatedEvent);
    setEvents((prev) =>
      prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
    );
  }, []);

  const handleEventResize = useCallback((updatedEvent: any) => {
    console.log("Resized event:", updatedEvent);
    setEvents((prev) =>
      prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
    );
  }, []);

  const handleEventClick = useCallback((event: any) => {
    console.log("Clicked event:", event);
  }, []);

  const handleDayClick = useCallback((dayDate: Date) => {
    alert(`Dia clicado: ${format(dayDate, "dd/MM/yyyy")}`);
  }, []);

  const handleSlotClick = useCallback((slotTime: Date) => {
    alert(
      `Slot clicado: ${format(
        slotTime,
        "HH:mm dd/MM/yyyy"
      )}. Pode adicionar um novo evento aqui.`
    );
  }, []);

  const handleResourceFilterChange = useCallback((selected: string[]) => {
    setFilteredResources(selected);
  }, []);

  const MyLeftHeaderPlugin: FC = () => (
    <button className="react-agendfy-btn">Plugin</button>
  );

  const MyRightHeaderPlugin: FC = () => {
    const [q, setQ] = useState("");
    return (
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Pesquisar..."
        className="react-agendfy-search-input"
        aria-label="Search events"
      />
    );
  };

  const MyCustomView: FC<any> = ({ events }) => (
    <div>Minha visão customizada ({events.length} eventos)</div>
  );

  return (
      <ErrorBoundary>
        <Suspense fallback={<div>Carregando calendário...</div>}>
          <Calendar
            ref={calendarRef}
            events={events}
            config={defaultConfig}
            onEventUpdate={handleEventUpdate}
            onEventClick={handleEventClick}
            onDayClick={handleDayClick}
            onSlotClick={handleSlotClick}
            resources={resources}
            onEventResize={handleEventResize}
            filteredResources={filteredResources}
            onResourceFilterChange={handleResourceFilterChange}
            emailAdapter={new ExampleEmailAdapter()}
            emailConfig={{ defaultRecipient: "user@example.com" }}
            theme="dark"
            plugins={[
              { location: "left", type: "filter", component: MyLeftHeaderPlugin },
              {
                location: "right",
                type: "search",
                component: MyRightHeaderPlugin,
              },
              {
                type: "view",
                viewName: "custom view",
                component: MyCustomView,
              },
              exportPdfPlugin,
              reportsExportPlugin,
              darkThemePlugin,
              timelineViewPlugin,
              googleCalendarPlugin,
            ]}
          />
        </Suspense>
      </ErrorBoundary>
  );
}

export default App;
