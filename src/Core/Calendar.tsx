import React, { useEffect, useState, useMemo, useCallback, memo, useRef, FC, SetStateAction } from "react";
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
import {  useToast } from "./Components/Toast/Toast";
import { TZDate } from "@date-fns/tz";
import { useEventReminder } from "./Notify/useEventReminder";
import { NotificationService } from "./Notify/NotificationService";

const MonthViewMemo = memo(MonthView);
const WeekViewMemo = memo(WeekView);
const DayViewMemo = memo(DayView);
const ListViewMemo = memo(ListView);

const defaultConfig = {
  timeZone: 'America/Sao_Paulo',
  defaultView: "week",
  slotDuration: 15,
  slotLabelFormat: "HH:mm",
  slotMin: "00:00",
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
  emailConfig
  
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState(initialEvents);
  const [localFilteredResources, setLocalFilteredResources] = useState(filteredResources);
  
  const addToast = useToast();

  const [localeConfig, setLocaleConfig] = useState(() => {
    const finalConfig = { ...defaultConfig, ...(config || {}) };
    return { ...finalConfig, ...getLocale(finalConfig.lang) };
  });

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
  }, [initialEvents]);

  useEffect(() => {
    setLocalFilteredResources(filteredResources);
  }, [filteredResources]);

  
  const alertConfig = localeConfig?.alerts;
  const [alertedEvents, setAlertedEvents] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (alertConfig.enabled && "Notification" in window && Notification.permission !== "granted") {
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
    config: localeConfig
  });


  const normalizedEvents = useMemo(() => normalizeEvents(events), [events]);
  const getFilteredEvents = useMemo(
    () => filterEvents(normalizedEvents, localFilteredResources),
    [normalizedEvents, localFilteredResources]
  );

  const handleViewChange = useCallback((newView: string) => {
    setLocaleConfig((prevConfig) => ({ ...prevConfig, defaultView: newView }));
  }, []);

  const handleNavigateToday = useCallback(() => {
    setCurrentDate(new  TZDate(new Date(), config.timeZone));
  }, []);

  const handleNavigateBack = useCallback(() => {
    const newDate = getNewDate(currentDate, localeConfig.defaultView, -1);
    setCurrentDate(new  TZDate(newDate,  config.timeZone));

  }, [currentDate, localeConfig.defaultView]);

  const handleNavigateForward = useCallback(() => {
    const newDate = getNewDate(currentDate, localeConfig.defaultView, 1);
    setCurrentDate(new  TZDate(newDate,  config.timeZone));

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

  const handleResourceFilterChange = useCallback((selected: SetStateAction<string[]>) => {
    setLocalFilteredResources(selected);
  }, []);

  

  return (
       <div className="flex flex-col h-full">
        <div className="sticky top-0 z-50 bg-white shadow">
          <CalendarHeader
            view={localeConfig.defaultView}
            onViewChange={handleViewChange}
            currentDate={currentDate}
            onNavigateToday={handleNavigateToday}
            onNavigateBack={handleNavigateBack}
            onNavigateForward={handleNavigateForward}
            config={localeConfig}
            resources={resources}
            onResourceFilterChange={handleResourceFilterChange}
          />
        </div>
        <div className="flex-1 overflow-auto">
          {localeConfig.defaultView === "week" ? (
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
          ) : localeConfig.defaultView === "month" ? (
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
          ) : localeConfig.defaultView === "day" ? (
            <DayViewMemo
              events={getFilteredEvents}
              currentDate={currentDate}
              onEventUpdate={handleEventUpdateInternal}
              onSlotClick={onSlotClick}
              config={localeConfig}
              onEventClick={onEventClick}
            />
          ) : (
            <ListViewMemo
              events={getFilteredEvents}
              onEventUpdate={handleEventUpdateInternal}
              onEventClick={onEventClick}
              currentDate={currentDate}
              config={localeConfig}

            />
          )}
        </div>
      </div>
   );
};

Calendar.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object),
  onEventUpdate: PropTypes.func,
  onEventClick: PropTypes.func,
  onDayClick: PropTypes.func,
  onSlotClick: PropTypes.func,
  onEventResize: PropTypes.func,
  config: PropTypes.shape({
    defaultView: PropTypes.oneOf(["month", "week", "day", "list"]),
    slotDuration: PropTypes.number,
    slotLabelFormat: PropTypes.string,
    slotMin: PropTypes.string,
    slotMax: PropTypes.string,
    lang: PropTypes.string,
    today: PropTypes.string,
    monthView: PropTypes.string,
    weekView: PropTypes.string,
    dayView: PropTypes.string,
    listView: PropTypes.string,
    all_day: PropTypes.string,
    clear_filter: PropTypes.string,
    filter_resources: PropTypes.string,
    alerts: PropTypes.object,
    businessHours: PropTypes.object,
    emailAdapter: PropTypes.bool,
    timeZone: PropTypes.string,


  }),
  resources: PropTypes.arrayOf(PropTypes.object),
  filteredResources: PropTypes.arrayOf(PropTypes.string),
};

Calendar.defaultProps = {
  events: [],
  resources: [],
  filteredResources: [],
};

export default Calendar;
