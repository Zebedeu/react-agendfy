import React, { useState, useEffect, useRef, useCallback, useMemo, FC } from "react";
import { Calendar, CalendarPlugin, Resource } from "@react-agendfy/core";
import darkThemePlugin from "@react-agendfy/plugin-theme";
import EventFormModal from "./components/EventFormModal";
import ErrorBoundary from "./components/ErrorBoundary";
import { Settings } from "lucide-react";
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
    const storedEvents = localStorage.getItem("agendfy-events");
    return storedEvents ? JSON.parse(storedEvents) : [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventData, setNewEventData] = useState<any>(null);
  const [filteredResources, setFilteredResources] = useState<string[]>([]);
  const [theme, setTheme] = useState<string>(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    localStorage.setItem("agendfy-events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === "light" ? "dark" : "light"));

  const [calendarConfig, setCalendarConfig] = useState(() => {
    const savedConfig = localStorage.getItem("agendfy-calendar-config");
    const defaultConfig = {
      timeZone: "Africa/Lagos",
      defaultView: "month",
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
      calendar_export: "Export"
    };
    return savedConfig ? { ...defaultConfig, ...JSON.parse(savedConfig) } : defaultConfig;
  });

  useEffect(() => {
    localStorage.setItem("agendfy-calendar-config", JSON.stringify(calendarConfig));
  }, [calendarConfig]);

  const handleEventUpdate = useCallback((updatedEvent: any) => {
    console.log("Evento atualizado:", updatedEvent);
    setEvents(prevEvents => 
      prevEvents.map(event => event.id === updatedEvent.id ? updatedEvent : event)
    );
    justUpdatedEvent.current = true;
    setTimeout(() => {
      justUpdatedEvent.current = false;
    }, 100);
  }, []);

  const handleOpenModal = useCallback((data: any) => {
    if (justUpdatedEvent.current) return;
    
    if (data instanceof Date) {
      setNewEventData({
        start: data.toISOString(),
        end: new Date(data.getTime() + 60 * 60 * 1000).toISOString(),
      });
    } else {
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

  const timezones = [
    'UTC',
    'Africa/Lagos',
    'America/New_York',
    'America/Los_Angeles',
    'America/Sao_Paulo',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney',
  ];

  const SettingsPlugin: FC<any> = ({ config, setConfig, allPlugins, activePlugins, setActivePlugins }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localConfig, setLocalConfig] = useState(config);
    const panelRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (isOpen && panelRef.current && !panelRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);
  
    const handleApply = () => {
      setConfig(localConfig);
      setIsOpen(false);
    };

    const handlePluginToggle = (pluginKey: string, isEnabled: boolean) => {
      setActivePlugins((prev: any) => ({
        ...prev,
        [pluginKey]: isEnabled,
      }));
    };
  
    return (
      <div className="settings-plugin-container" ref={panelRef}>
        <button type="button" className="fc-button fc-button-primary" onClick={() => setIsOpen(!isOpen)}>
          <Settings size={16} />
        </button>
        {isOpen && (
          <div className="settings-panel">
            <h3>Calendar Settings</h3>
            <div className="form-group">
              <label>Slot Duration (minutes)</label>
              <input
                type="number"
                value={localConfig.slotDuration}
                onChange={(e) => setLocalConfig({ ...localConfig, slotDuration: parseInt(e.target.value, 10) })}
              />
            </div>
            <div className="form-group">
              <label>Min Time</label>
              <input
                type="time"
                value={localConfig.slotMin}
                onChange={(e) => setLocalConfig({ ...localConfig, slotMin: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Max Time</label>
              <input
                type="time"
                value={localConfig.slotMax}
                onChange={(e) => setLocalConfig({ ...localConfig, slotMax: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Timezone</label>
              <select
                value={localConfig.timeZone}
                onChange={(e) => setLocalConfig({ ...localConfig, timeZone: e.target.value })}
              >
                {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="enableExport"
                name="export"
                checked={localConfig.export}
                onChange={(e) => setLocalConfig({ ...localConfig, export: e.target.checked })}
              />
              <label htmlFor="enableExport">
                Enable Export
              </label>
            </div>
            <div className="form-group">
              <label>Active Plugins</label>
              <div className="plugins-toggle-container">
                {allPlugins.filter((p: any) => p.key !== 'settings').map((plugin: any) => (
                  <div key={plugin.key} className="checkbox-group">
                    <input
                      type="checkbox"
                      id={`plugin-${plugin.key}`}
                      checked={!!activePlugins[plugin.key]}
                      onChange={(e) => handlePluginToggle(plugin.key, e.target.checked)}
                    />
                    <label htmlFor={`plugin-${plugin.key}`}>{plugin.label}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={handleApply} className="btn-submit">Apply</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const MyCustomView: FC<any> = ({ events }) => (
    <div>My customized view ({events.length} events)</div>
  );

  const allPlugins = useMemo<Array<CalendarPlugin & { label: string }>>(() => [
    { key: 'themeToggle', location: "left", type: "search", component: MyLeftHeaderPlugin, label: 'Theme Toggle' },
    { key: 'resourceFilter', ...resourceFilterPlugin, location: "right", label: 'Resource Filter' },
    { key: 'settings', location: "left", type: "search", component: SettingsPlugin, label: 'Settings' },
    { key: 'search', location: "right", type: "search", component: MyRightHeaderPlugin, label: 'Search' },
    { key: 'customView', type: "view", viewName: "custom view", component: MyCustomView, label: 'Custom View' },
    { key: 'darkTheme',...darkThemePlugin, label: 'Dark Theme' },
    ...exportsPlugin,
  ], []);

  const [activePlugins, setActivePlugins] = useState(() => {
    const saved = localStorage.getItem('agendfy-active-plugins');
    if (saved) {
      return JSON.parse(saved);
    }
    const defaultActive: { [key: string]: boolean } = {};
    allPlugins.forEach(p => {
      defaultActive[p.key] = p.key === 'settings';
    });
    return defaultActive;
  });

  useEffect(() => {
    localStorage.setItem('agendfy-active-plugins', JSON.stringify(activePlugins));
  }, [activePlugins]);

  const enabledPlugins = useMemo(() => {
    // Passa as props necessárias para o SettingsPlugin funcionar
    const pluginsWithProps = allPlugins.map(p => {
      if (p.key === 'settings') {
        return { ...p, props: { config: calendarConfig, setConfig: setCalendarConfig, allPlugins, activePlugins, setActivePlugins } };
      }
      return p;
    });
    // Filtra para mostrar apenas os plugins ativos, garantindo que 'settings' e plugins de tema estejam sempre lá
    return pluginsWithProps.filter(p => 
      activePlugins[p.key] || p.key === 'settings' || p.type === 'theme'
    );
  }, [allPlugins, activePlugins, calendarConfig]);

  return (
    <ErrorBoundary>
      <div style={{width: "100%", height: 'auto', display: "flex", flexDirection: "column"}}>
        <Calendar 
          ref={calendarRef}
          events={events}
          config={calendarConfig}
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
          plugins={enabledPlugins}
        />
        <EventFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSaveEvent}
          eventData={newEventData}
          resources={resources}
          config={calendarConfig}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;