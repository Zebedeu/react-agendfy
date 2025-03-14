import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  memo,
  useRef,
  FC,
  SetStateAction,
} from "react";
import CalendarHeader from "./Components/CalendarHeader";
import DayView from "./Components/View/DayView/DayView";
import WeekView from "./Components/View/WeekView/WeekView";
import MonthView from "./Components/View/MonthView/MonthView";
import ListView from "./Components/View/ListView/ListView";
import { getLocale } from "../Utils/locate";
import PropTypes from "prop-types";
import { CalendarProps, EventProps } from "../types";
import { getNewDate } from "../Utils/calendarNavigation";
import { normalizeEvents, filterEvents } from "../Utils/calendarHelpers";
import { useToast } from "./Components/Toast/Toast";
import { TZDate } from "@date-fns/tz";
import { useEventReminder } from "./Notify/useEventReminder";
import { NotificationService } from "./Notify/NotificationService";
import { generateICalContent } from "../Utils/downlaodEvent";

const MonthViewMemo = memo(MonthView);
const WeekViewMemo = memo(WeekView);
const DayViewMemo = memo(DayView);
const ListViewMemo = memo(ListView);

const defaultConfig = {
  timeZone: "America/Sao_Paulo",
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

  alerts: {
    enabled: false,
    thresholdMinutes: 15,
  },
  export: true,
  calendar_export: "Export",
};

const Calendar: FC<CalendarProps> = ({
  events: initialEvents = [],
  onEventUpdate,
  onEventResize,
  onEventClick,
  onDayClick,
  onSlotClick,
  config = defaultConfig,
  resources = [],
  filteredResources = [],
  emailAdapter,
  emailConfig,
  plugins,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState(initialEvents);
  const [localFilteredResources, setLocalFilteredResources] =
    useState(filteredResources);
    const [pluginFilteredEvents, setPluginFilteredEvents] = useState<EventProps[]>([]);
    const [pluginSearchResults, setPluginSearchResults] = useState<EventProps[]>([]);
    const [isSearchActive, setIsSearchActive] = useState(false);
  
  const addToast = useToast();

  const [localeConfig, setLocaleConfig] = useState(() => {
    const finalConfig = { ...defaultConfig, ...(config || {}) };
    return { ...finalConfig, ...getLocale(finalConfig.lang) };
  });
  console.log("Plugins:", plugins);

  const lastRelevantConfigRef = useRef(config);
  useEffect(() => {
    if (config && typeof config === "object") {
      const isRelevantConfigChange =
        !lastRelevantConfigRef.current ||
        config.lang !== lastRelevantConfigRef.current.lang ||
        config.defaultView !== lastRelevantConfigRef.current.defaultView;
      if (isRelevantConfigChange) {
        setLocaleConfig((prevConfig) => {
          const updatedConfig = {
            ...prevConfig,
            ...config,
            ...getLocale(config.lang || prevConfig.lang),
          };
          lastRelevantConfigRef.current = config;
          return updatedConfig;
        });
      }
    }
  }, [config]);

  useEffect(() => {
    setEvents(initialEvents);
    setPluginFilteredEvents(initialEvents);
    setPluginSearchResults(initialEvents);  
    setIsSearchActive(false);

  }, [initialEvents]);

  useEffect(() => {
    setLocalFilteredResources(filteredResources);
  }, [filteredResources]);

  const alertConfig = localeConfig?.alerts;

  useEffect(() => {
    if (
      alertConfig.enabled &&
      "Notification" in window &&
      Notification.permission !== "granted"
    ) {
      Notification.requestPermission();
    }
  }, [alertConfig.enabled]);

  const notificationService = useMemo(
    () =>
      new NotificationService({
        emailAdapter,
        emailConfig,
      }),
    [emailAdapter, emailConfig]
  );
  useEventReminder({
    events,
    notificationService,
    addToast,
    alertConfig,
    config: localeConfig,
  });

  const normalizedEvents = useMemo(() => normalizeEvents(events), [events]);
 
  const handleExport = () => {
    const iCalContent = generateICalContent(getFilteredEvents, localeConfig);
    const filename = "events.ics";
    const blob = new Blob([iCalContent], {
      type: "text/calendar;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const [currentView, setCurrentView] = useState(config.defaultView); // Usar estado local para a view atual

  const handleViewChange = useCallback((newView: string) => {
    setCurrentView(newView);
    setLocaleConfig(prevConfig => ({ ...prevConfig, defaultView: newView })); // Atualizar config para outras partes do componente
  }, []);

 

  const handleNavigateToday = useCallback(() => {
    setCurrentDate(new TZDate(new Date(), config.timeZone));
  }, []);

  const handleNavigateBack = useCallback(() => {
    const newDate = getNewDate(currentDate, localeConfig.defaultView, -1);
    setCurrentDate(new TZDate(newDate, config.timeZone));
  }, [currentDate, localeConfig.defaultView]);

  const handleNavigateForward = useCallback(() => {
    const newDate = getNewDate(currentDate, localeConfig.defaultView, 1);
    setCurrentDate(new TZDate(newDate, config.timeZone));
  }, [currentDate, localeConfig.defaultView]);

  const handleEventUpdateInternal = useCallback(
    (updatedEvent: EventProps) => {
      setEvents((currentEvents) => {
        if (Array.isArray(updatedEvent)) {
          return updatedEvent;
        } else if (updatedEvent && typeof updatedEvent === "object") {
          return currentEvents.map((event) =>
            event.id === updatedEvent.id ? updatedEvent : event
          );
        }
        return currentEvents;
      });
      if (onEventUpdate) {
        onEventUpdate(updatedEvent);
      }
    },
    [onEventUpdate]
  );

  const filterPlugins = useMemo(
    () => plugins.filter(plugin => plugin.type === 'filter'),
    [plugins]
  );

  const searchPlugins = useMemo(
    () => plugins.filter(plugin => plugin.type === 'search'),
    [plugins]
  );
  const handleFilterChangeFromPlugin = useCallback((filtered: EventProps) => {
    setPluginFilteredEvents(filtered);
  }, []);

  const handleSearchFromPlugin = useCallback((searchTerm: string, results: EventProps) => {
    setPluginSearchResults(results);
    setIsSearchActive(searchTerm.length > 0);
  }, []);



  const handleEventResizeInternal = useCallback(
    (resizeEvent: EventProps) => {
      setEvents((currentEvents) => {
        if (Array.isArray(resizeEvent)) {
          return resizeEvent;
        } else if (resizeEvent && typeof resizeEvent === "object") {
          return currentEvents.map((event) =>
            event.id === resizeEvent.id ? resizeEvent : event
          );
        }
        return currentEvents;
      });
      if (onEventResize) {
        onEventResize(resizeEvent);
      }
    },
    [onEventResize]
  );

  const handleResourceFilterChange = useCallback(
    (selected: SetStateAction<string[]>) => {
      setLocalFilteredResources(selected);
    },
    []
  );

  const customViewPlugins = useMemo(
    () => plugins.filter(plugin => plugin.location === 'view'),
    [plugins]
  );

  const availableViews = useMemo(() => {
    const defaultViews = [
      { name: 'week', label: localeConfig.weekView },
      { name: 'month', label: localeConfig.monthView },
      { name: 'day', label: localeConfig.dayView },
      { name: 'list', label: localeConfig.listView },
    ];

    const customViewsFromPlugins = customViewPlugins.map(plugin => ({
      name: plugin.viewName,
      label: plugin.props?.label || plugin.viewName, // Usar label da prop se existir, senão usar viewName
    }));

    return [...defaultViews, ...customViewsFromPlugins];
  }, [plugins, localeConfig]);

  const allCustomViews = useMemo(() => {
    const views: Record<string, FC<any>> = {};
    customViewPlugins.forEach(plugin => {
      if (plugin.viewName && plugin.component) {
        views[plugin.viewName] = plugin.component;
      }
    });
    return views;
  }, [customViewPlugins]);

 

  const getFilteredEvents = useMemo(
    () => {
      let filteredByResource = filterEvents(normalizedEvents, localFilteredResources);
      let filteredByPlugin = pluginFilteredEvents.filter(event =>
        filteredByResource.some(e => e.id === event.id)
      );
      return isSearchActive ? pluginSearchResults.filter(event =>
        filteredByPlugin.some(e => e.id === event.id)
      ) : filteredByPlugin;
    },
    [normalizedEvents, localFilteredResources, pluginFilteredEvents, pluginSearchResults, isSearchActive]
  );

  const headerLeftPlugins = useMemo(
    () => {
      const leftPlugins = filterPlugins.filter(plugin => plugin.location === 'left');
      console.log("Header Left Plugins:", leftPlugins);
      return leftPlugins.map(plugin => (
        plugin.component ? (
          <plugin.component
            key={plugin.key || Math.random()}
            events={normalizedEvents}
            onFilterChange={handleFilterChangeFromPlugin}
            config={localeConfig}
            {...plugin.props}
          />
        ) : null
      ));
    },
    [filterPlugins, normalizedEvents, handleFilterChangeFromPlugin, localeConfig]
  );

  const headerRightPlugins = useMemo(
    () => plugins.filter(plugin => plugin.type === 'search' && plugin.location === 'right').map(plugin => (
      plugin.component ? (
        <plugin.component
          key={plugin.key || Math.random()}
          events={normalizedEvents}
          onSearch={handleSearchFromPlugin}
          config={localeConfig}
          {...plugin.props}
        />
      ) : null
    )),
    [searchPlugins, normalizedEvents, handleSearchFromPlugin, localeConfig]
  );

  
 

  return (
    <div className="react-agenfy-layout">
      <div className="react-agenfy-layout-header">
        <CalendarHeader
          view={localeConfig.defaultView}
          onViewChange={handleViewChange}
          currentDate={currentDate}
          onNavigateToday={handleNavigateToday}
          onNavigateBack={handleNavigateBack}
          onNavigateForward={handleNavigateForward}
          config={localeConfig}
          resources={resources}
          onDownloadcalendar={handleExport}
          onResourceFilterChange={handleResourceFilterChange}
          leftControls={headerLeftPlugins}
          rightControls={headerRightPlugins}
          availableViews={availableViews}
          currentView={currentView}

        />
      </div>
      <div className="react-agenfy-layout-content">
        <div className="react-agenfy-layout-content">
        {(() => {
          const customViewComponent = allCustomViews[currentView];
          if (customViewComponent) {
            return React.createElement(customViewComponent, {
              events: getFilteredEvents,
              currentDate: currentDate,
              config: localeConfig,
              onEventUpdate: handleEventUpdateInternal,
              onEventResize: handleEventResizeInternal,
              onEventClick: onEventClick,
              onDayClick: onDayClick,
              onSlotClick: onSlotClick,
              resources: resources,
              filteredResources: localFilteredResources,
            });
          }


            switch (localeConfig.defaultView) {
              case "week":
                return (
                  <WeekViewMemo
                    events={getFilteredEvents}
                    slotMin={localeConfig.slotMin}
                    slotMax={localeConfig.slotMax}
                    onEventUpdate={handleEventUpdateInternal}
                    onEventResize={handleEventResizeInternal}
                    onEventClick={onEventClick}
                    onDayClick={onDayClick}
                    onSlotClick={onSlotClick}
                    currentDate={currentDate}
                    config={localeConfig}
                  />
                );
              case "month":
                return (
                  <MonthViewMemo
                    events={getFilteredEvents}
                    onDayClick={onDayClick}
                    currentDate={currentDate}
                    onEventUpdate={handleEventUpdateInternal}
                    onEventResize={handleEventResizeInternal}
                    showResourceView={true}
                    config={localeConfig}
                    onEventClick={onEventClick}
                  />
                );
              case "day":
                return (
                  <DayViewMemo
                    events={getFilteredEvents}
                    currentDate={currentDate}
                    onEventUpdate={handleEventUpdateInternal}
                    onSlotClick={onSlotClick}
                    config={localeConfig}
                    onEventClick={onEventClick}
                  />
                );
              case "list":
                return (
                  <ListViewMemo
                    events={getFilteredEvents}
                    onEventUpdate={handleEventUpdateInternal}
                    onEventClick={onEventClick}
                    currentDate={currentDate}
                    config={localeConfig}
                  />
                );
              default:
                return <div>Unsupported view: {localeConfig.defaultView}</div>;
            }
          })()}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
