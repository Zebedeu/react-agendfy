import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  useRef,
  FC,
  SetStateAction,
} from "react";
import CalendarHeader from "../Components/CalendarHeader";
import DayView from "./DayView/DayView";
import WeekView from "./WeekView/WeekView";
import MonthView from "./MonthView/MonthView";
import ListView from "./ListView/ListView";
import { getLocale } from "../Utils/locate";
import { CalendarProps, EventProps, Resource } from "../types";
import { normalizeEvents } from "../Utils/calendarHelpers";
import { useToast } from "../Components/Toast/Toast";
import { useEventReminder } from "../hooks/useEventReminder";
import { NotificationService } from "../Notify/NotificationService";
import { CalendarPlugin } from "../types/plugns";
import {
  updateEventsList,
  getFilteredEventsList,
  exportCalendarEvents,
} from "../Utils/CalendarUtils";
import useCalendarNavigation from "../hooks/useCalendarNavigation";
import usePluginManagement from "../hooks/usePluginManagement";
import useDataSourceEvents from "../hooks/useDataSourceEvents";

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
  plugins = [],
}) => {

  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState(initialEvents);
  const [localFilteredResources, setLocalFilteredResources] = useState(filteredResources);
  const [pluginFilteredEvents, setPluginFilteredEvents] = useState<EventProps[]>(initialEvents);
  const [pluginSearchResults, setPluginSearchResults] = useState<EventProps[]>(initialEvents);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [dataSourceEvents, setDataSourceEvents] = useState<EventProps[]>([]);
  const [isDataSourceLoading, setIsDataSourceLoading] = useState(false);
  const [dataSourceError, setDataSourceError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState(config.defaultView);

  const addToast = useToast();

   const [localeConfig, setLocaleConfig] = useState(() => {
    const finalConfig = { ...defaultConfig, ...config };
    return { ...finalConfig, ...getLocale(finalConfig.lang) };
  });
  const lastRelevantConfigRef = useRef(config);

  useEffect(() => {
    if (config && typeof config === "object") {
      const isRelevantChange =
        !lastRelevantConfigRef.current ||
        config.lang !== lastRelevantConfigRef.current.lang ||
        config.defaultView !== lastRelevantConfigRef.current.defaultView;
      if (isRelevantChange) {
        setLocaleConfig((prevConfig) => ({
          ...prevConfig,
          ...config,
          ...getLocale(config.lang || prevConfig.lang),
        }));
        lastRelevantConfigRef.current = config;
      }
    }
  }, [config]);

  useEffect(() => {
    setEvents(initialEvents);
    setPluginFilteredEvents(initialEvents);
    setPluginSearchResults(initialEvents);
    setIsSearchActive(false);
  }, [initialEvents]);

  
 /*   useEffect(() => {
    setLocalFilteredResources(filteredResources);
  }, [filteredResources]);
  */
   useEffect(() => {
    if (
      localeConfig.alerts.enabled &&
      "Notification" in window &&
      Notification.permission !== "granted"
    ) {
      Notification.requestPermission();
    }
  }, [localeConfig.alerts.enabled]);

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
    alertConfig: localeConfig.alerts,
    config: localeConfig,
  });


  const normalizedEvents = useMemo(() => normalizeEvents(events), [events]);

  const filteredEvents = useMemo(
    () =>
      getFilteredEventsList(
        normalizedEvents,
        localFilteredResources,
        pluginFilteredEvents,
        pluginSearchResults,
        isSearchActive
      ),
    [normalizedEvents, localFilteredResources, pluginFilteredEvents, pluginSearchResults, isSearchActive]
  );


  const handleExport = useCallback(() => {
    exportCalendarEvents(filteredEvents, localeConfig);
  }, [filteredEvents, localeConfig]);


  const handleViewChange = useCallback((newView: string) => {
    setCurrentView(newView);
    setLocaleConfig((prev) => ({ ...prev, defaultView: newView }));
  }, []);


  const { navigateToday, navigateBack, navigateForward } = useCalendarNavigation({
    currentDate,
    defaultView: localeConfig.defaultView,
    timeZone: config.timeZone,
    setCurrentDate,
  });


  const handleEventUpdateInternal = useCallback(
    (updatedEvent: EventProps) => {
      setEvents((currentEvents) => updateEventsList(currentEvents, updatedEvent));
      onEventUpdate && onEventUpdate(updatedEvent);
    },
    [onEventUpdate]
  );
  
  const handleEventResizeInternal = useCallback(
    (resizeEvent: EventProps) => {
      setEvents((currentEvents) => updateEventsList(currentEvents, resizeEvent));
      onEventResize && onEventResize(resizeEvent);
    },
    [onEventResize]
  );


    const { filterPlugins, searchPlugins, dataSourcePlugins, customViewPlugins } =
    usePluginManagement(plugins);

  const handleFilterChangeFromPlugin = useCallback((filtered: EventProps[]) => {
    setPluginFilteredEvents(filtered);
  }, []);

  const handleSearchFromPlugin = useCallback((searchTerm: string, results: EventProps[]) => {
    setPluginSearchResults(results);
    setIsSearchActive(searchTerm.length > 0);
  }, []);

  const stableDataSourcePlugins = useMemo(
    () => dataSourcePlugins,
    [JSON.stringify(dataSourcePlugins)]
  );  const stableLocaleConfig = useMemo(() => config, [config]);
  
  useDataSourceEvents(stableDataSourcePlugins, stableLocaleConfig, currentDate);


  const handleResourceFilterChange = useCallback((selected: SetStateAction<string[]>) => {
    setLocalFilteredResources(selected);
  }, []);

  const availableViews = useMemo(() => {
    const defaultViews = [
      { name: "month", label: localeConfig.monthView },
      { name: "week", label: localeConfig.weekView },
      { name: "day", label: localeConfig.dayView },
      { name: "list", label: localeConfig.listView },
    ];
    const customViews = customViewPlugins.map((plugin: CalendarPlugin) => ({
      name: plugin.viewName,
      label: plugin.props?.label || plugin.viewName,
    }));
    return [...defaultViews, ...customViews];
  }, [localeConfig, customViewPlugins]);

  const allCustomViews = useMemo(() => {
    const views: Record<string, FC<any>> = {};
    customViewPlugins.forEach((plugin: CalendarPlugin) => {
      if (plugin.viewName && plugin.component) {
        views[plugin.viewName] = plugin.component;
      }
    });
    return views;
  }, [customViewPlugins]);

  const headerLeftPlugins = useMemo(
    () =>
      filterPlugins
        .filter((plugin: CalendarPlugin) => plugin.location === "left")
        .map((plugin: CalendarPlugin) =>
          plugin.component ? (
            <plugin.component
              key={plugin.key || Math.random()}
              events={normalizedEvents}
              onFilterChange={handleFilterChangeFromPlugin}
              config={localeConfig}
              {...plugin.props}
            />
          ) : null
        ),
    [filterPlugins, normalizedEvents, handleFilterChangeFromPlugin, localeConfig]
  );

  const headerRightPlugins = useMemo(
    () =>
      searchPlugins
        .filter((plugin: CalendarPlugin) => plugin.location === "right")
        .map((plugin: CalendarPlugin) =>
          plugin.component ? (
            <plugin.component
              key={plugin.key || Math.random()}
              events={normalizedEvents}
              onSearch={handleSearchFromPlugin}
              config={localeConfig}
              {...plugin.props}
            />
          ) : null
        ),
    [searchPlugins, normalizedEvents, handleSearchFromPlugin, localeConfig]
  );

  const renderViewComponent = () => {
    const CustomViewComponent = allCustomViews[currentView];
    if (CustomViewComponent) {
      return (
        <CustomViewComponent
          events={filteredEvents}
          currentDate={currentDate}
          config={localeConfig}
          onEventUpdate={handleEventUpdateInternal}
          onEventResize={handleEventResizeInternal}
          onEventClick={onEventClick}
          onDayClick={onDayClick}
          onSlotClick={onSlotClick}
          resources={resources}
          filteredResources={localFilteredResources}
        />
      );
    }
    switch (localeConfig.defaultView) {
      case "week":
        return (
          <WeekViewMemo
            events={filteredEvents}
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
            events={filteredEvents}
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
            events={filteredEvents}
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
            events={filteredEvents}
            onEventUpdate={handleEventUpdateInternal}
            onEventClick={onEventClick}
            currentDate={currentDate}
            config={localeConfig}
          />
        );
      default:
        return <div>Unsupported view: {localeConfig.defaultView}</div>;
    }
  };


  return (
    <div className="react-agenfy-layout">
      <div className="react-agenfy-layout-header">
        <CalendarHeader
         view={localeConfig.defaultView}
         onViewChange={(newView) => {
           setCurrentView(newView);
           setLocaleConfig((prev) => ({ ...prev, defaultView: newView }));
         }}
           currentDate={currentDate}
          onNavigateToday={navigateToday}
          onNavigateBack={navigateBack}
          onNavigateForward={navigateForward}
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
      <div className="react-agenfy-layout-content">{renderViewComponent()}</div>
    </div>
  );
};

export default Calendar;
