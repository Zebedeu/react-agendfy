import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  FC,
  SetStateAction,
  lazy,
} from "react";
import CalendarHeader from "../Components/CalendarHeader";
import { getLocale } from "../Utils/locate";
import { CalendarProps, EventProps } from "../types/types";
import { normalizeEvents } from "../Utils/calendarHelpers";
import { useToast } from "../Components/Toast/Toast";
import { useEventReminder } from "../hooks/useEventReminder";
import { NotificationService } from "../Notify/NotificationService";
import {
  updateEventsList,
  getFilteredEventsList,
  exportCalendarEvents,
  downloadFile,
} from "./../Utils/CalendarUtils";
import useCalendarNavigation from "../hooks/useCalendarNavigation";
import usePluginManagement from "../hooks/usePluginManagement";
import { CalendarPlugin, ViewPlugin, ExportPlugin, CustomFilterPlugin, ThemePlugin } from "../types/plugins";
import useDataSourceEvents from "../hooks/useDataSourceEvents";
import { TZDate } from "@date-fns/tz";

const MonthView = lazy(() => import("./MonthView/MonthView"));
const WeekView = lazy(() => import("./WeekView/WeekView"));
const DayView = lazy(() => import("./DayView/DayView"));
const AgendaView = lazy(() => import("./AgendaView"));
const ListView = lazy(() => import("./ListView/ListView"));

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
  schedule: "Schedule",
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
  onDateRangeSelect,
  config = defaultConfig,
  resources = [],
  theme = 'default',
  filteredResources = [],
  emailAdapter,
  emailConfig,
  plugins = [],
}) => {
  const [currentDate, setCurrentDate] = useState(() => new TZDate(new Date(), config.timeZone || defaultConfig.timeZone));
  const [events, setEvents] = useState<EventProps[]>(initialEvents);
  const [localFilteredResources, setLocalFilteredResources] = useState<string[] | SetStateAction<string[]>>(filteredResources as any);
  const [pluginFilteredEvents, setPluginFilteredEvents] = useState<EventProps[]>(initialEvents);
  const [pluginSearchResults, setPluginSearchResults] = useState<EventProps[]>(initialEvents);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [dataSourceEvents, setDataSourceEvents] = useState<EventProps[]>([]);
  const [isDataSourceLoading, setIsDataSourceLoading] = useState(false);
  const [dataSourceError, setDataSourceError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<string>(config.defaultView);
  const [customFilterValues, setCustomFilterValues] = useState<Record<string, any>>({});

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

  const { filterPlugins, searchPlugins, dataSourcePlugins, customViewPlugins, eventRenderingPlugins, interactionPlugins, themePlugins, exportPlugins, customFilterPlugins } =
    usePluginManagement(plugins);

  useEffect(() => {
    const activeThemePlugin = themePlugins.find((p: ThemePlugin) => p.themeName === theme);

    if (activeThemePlugin && activeThemePlugin.cssVariables) {
      const root = document.documentElement;
      Object.entries(activeThemePlugin.cssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });

      return () => {
        Object.keys(activeThemePlugin.cssVariables!).forEach(key => {
          root.style.removeProperty(key);
        });
      };
    }
  }, [theme, themePlugins]);

  useEffect(() => {
    setEvents(initialEvents);
    setPluginFilteredEvents(initialEvents);
    setPluginSearchResults(initialEvents);
    setIsSearchActive(false);
  }, [initialEvents]);

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

  const handleCustomFilterChange = useCallback((filterName: string, value: any) => {
    setCustomFilterValues(prev => ({ ...prev, [filterName]: value }));
  }, []);

  const filteredEvents = useMemo(
    () =>
      getFilteredEventsList(
        normalizedEvents,
        localFilteredResources as any,
        pluginFilteredEvents,
        pluginSearchResults,
        isSearchActive
      ),
    [normalizedEvents, localFilteredResources, pluginFilteredEvents, pluginSearchResults, isSearchActive]
  );

  const handleExport = useCallback((format: string) => {
    const customExportPlugin = exportPlugins.find((p: ExportPlugin) => p.formatName === format);

    if (customExportPlugin) {
      const contentPromise = Promise.resolve(customExportPlugin.exportFunction(filteredEvents, localeConfig));
      contentPromise.then(content => {
        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `calendar-events-${dateStr}.${customExportPlugin.fileExtension}`;
        const mimeType = customExportPlugin.mimeType;
        downloadFile(content, fileName, mimeType);
      }).catch(error => {
        console.error(`Error exporting with plugin ${format}:`, error);
        addToast({ message: `Erro ao exportar para ${format}`, type: 'error' });
      });
    } else {
      exportCalendarEvents(filteredEvents, localeConfig, format as any);
    }
  }, [filteredEvents, localeConfig, exportPlugins, addToast]);

  const handleViewChange = useCallback((newView: string) => {
    setCurrentView(newView);
    setLocaleConfig((prev) => ({ ...prev, defaultView: newView }));
  }, []);

  const { navigateToday, navigateBack, navigateForward } = useCalendarNavigation({
    currentDate,
    defaultView: currentView,
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
  );
  const stableLocaleConfig = useMemo(() => config, [config]);

  useDataSourceEvents(stableDataSourcePlugins, stableLocaleConfig, currentDate);

  const handleResourceFilterChange = useCallback((selected: SetStateAction<string[]>) => {
    setLocalFilteredResources(selected);
  }, []);

  const handleDateRangeSelect = useCallback(
     (resizeEvent: EventProps) => {
      setEvents((currentEvents) => updateEventsList(currentEvents, resizeEvent));
      onDateRangeSelect && onDateRangeSelect(resizeEvent);
    },
    [onDateRangeSelect]
  );

  const availableViews = useMemo(() => {
    const defaultViews = [
      { name: "month", label: localeConfig.monthView },
      { name: "week", label: localeConfig.weekView },
      { name: "day", label: localeConfig.dayView },
      { name: "list", label: localeConfig.listView },
      { name: "schedule", label: localeConfig.schedule }
    ];
    const customViews = customViewPlugins.map((plugin: ViewPlugin) => ({
      name: plugin.viewName,
      label: plugin.props?.label || plugin.viewName,
    }));
    return [...defaultViews, ...customViews];
  }, [localeConfig, customViewPlugins]);

  const allCustomViews = useMemo(() => {
    const views: Record<string, FC<any>> = {};
    customViewPlugins.forEach((plugin: CalendarPlugin) => {
      const p = plugin as ViewPlugin;
      if (p.viewName && p.component) {
        views[p.viewName] = p.component;
      }
    });
    return views;
  }, [customViewPlugins]);

  const combinedExclusivePlugins = useMemo(() => {
    type Entry = { plugin: CalendarPlugin; sources: Set<'filter' | 'search'> };
    const map = new Map<string, Entry>();

    const makeKey = (p: CalendarPlugin, idx: number) =>
      p.key || (p as any).props?.name || (p as any).viewName || `${(p.type||'plugin')}-${idx}`;

    filterPlugins.forEach((p: CalendarPlugin, idx: number) => {
      const k = makeKey(p, idx);
      const existing = map.get(k);
      if (existing) existing.sources.add('filter');
      else map.set(k, { plugin: p, sources: new Set(['filter']) });
    });

    searchPlugins.forEach((p: CalendarPlugin, idx: number) => {
      const k = makeKey(p, idx);
      const existing = map.get(k);
      if (existing) existing.sources.add('search');
      else map.set(k, { plugin: p, sources: new Set(['search']) });
    });

    const leftList: CalendarPlugin[] = [];
    const rightList: CalendarPlugin[] = [];

    Array.from(map.values()).forEach(({ plugin, sources }) => {
      if (plugin.location === 'left') {
        leftList.push(plugin);
      } else if (plugin.location === 'right') {
        rightList.push(plugin);
      } else {
        if (sources.has('search') && !sources.has('filter')) {
          rightList.push(plugin);
        } else {
          leftList.push(plugin);
        }
      }
    });

    return { leftList, rightList };
  }, [filterPlugins, searchPlugins]);

  const headerLeftPlugins = useMemo(() => {
    return combinedExclusivePlugins.leftList.map((plugin, idx) =>
      plugin.component ? (
        <plugin.component
          key={plugin.key ?? `left-${idx}`}
          events={normalizedEvents}
          onFilterChange={handleFilterChangeFromPlugin}
          onSearch={handleSearchFromPlugin}
          config={localeConfig}
          {...plugin.props}
        />
      ) : null
    );
  }, [combinedExclusivePlugins, normalizedEvents, handleFilterChangeFromPlugin, handleSearchFromPlugin, localeConfig]);

  const headerRightPlugins = useMemo(() => {
    return combinedExclusivePlugins.rightList.map((plugin, idx) =>
      plugin.component ? (
        <plugin.component
          key={plugin.key ?? `right-${idx}`}
          events={normalizedEvents}
          onFilterChange={handleFilterChangeFromPlugin}
          onSearch={handleSearchFromPlugin}
          config={localeConfig}
          {...plugin.props}
        />
      ) : null
    );
  }, [combinedExclusivePlugins, normalizedEvents, handleFilterChangeFromPlugin, handleSearchFromPlugin, localeConfig]);

  const renderViewComponent = () => {
    const CustomViewComponent = allCustomViews[currentView];
    if (CustomViewComponent) {
        return <CustomViewComponent
          events={filteredEvents}
          currentDate={currentDate}
          config={localeConfig}
          onEventUpdate={handleEventUpdateInternal}
          onEventResize={handleEventResizeInternal}
          onEventClick={onEventClick}
          onDayClick={onDayClick}
          onSlotClick={onSlotClick}
          resources={resources}
          filteredResources={localFilteredResources as any}
        />
    }
    switch (currentView) {
      case "week":
        return (
          <WeekView
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
            interactionPlugin={interactionPlugins}
            onDateRangeSelect={handleDateRangeSelect}
            eventRenderingPlugins={eventRenderingPlugins}
          />
        );
      case "month":
        return (
          <MonthView
            events={filteredEvents}
            onDayClick={onDayClick}
            currentDate={currentDate}
            onEventUpdate={handleEventUpdateInternal}
            onEventResize={handleEventResizeInternal}
            showResourceView={true}
            config={localeConfig}
            onEventClick={onEventClick}
            onDateRangeSelect={handleDateRangeSelect}
          />
        );
      case "day":
        return (
          <DayView
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
          <ListView
            events={filteredEvents}
            onEventUpdate={handleEventUpdateInternal}
            onEventClick={onEventClick}
            currentDate={currentDate}
            config={localeConfig}
          />
        );
      case "schedule":
        return (
          <AgendaView
            events={filteredEvents}
            onEventClick={onEventClick}
            currentDate={currentDate}
            config={localeConfig}
          />
        );
      default:
        return <div>Unsupported view: {localeConfig.defaultView}</div>;
    }
  };

  const exportOptions = useMemo(() => {
    const defaultOptions = [
      { formatName: 'ics', label: 'Exportar para .ics' },
      { formatName: 'csv', label: 'Exportar para .csv' },
      { formatName: 'json', label: 'Exportar para .json' },
    ];
    const pluginOptions = exportPlugins.map((plugin: ExportPlugin) => ({
      formatName: plugin.formatName,
      label: plugin.label,
    }));
    return [...defaultOptions, ...pluginOptions];
  }, [exportPlugins]);

  return (
    <div className={`react-agenfy-layout theme-${theme}`}>
      <div className="react-agenfy-layout-header">
        <CalendarHeader
          view={currentView}
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
          exportOptions={exportOptions}
          leftControls={headerLeftPlugins}
          rightControls={headerRightPlugins}
          availableViews={availableViews}
          currentView={currentView}
        />
      </div>
      <div
        className="visually-hidden"
        aria-live="polite"
        aria-atomic="true"
      >
        {`Current view: ${currentView}. Period: ${currentDate.toLocaleDateString(config.lang)}`}
      </div>
      <div className="react-agenfy-layout-content">{renderViewComponent()}</div>
    </div>
  );
};

export default Calendar;
