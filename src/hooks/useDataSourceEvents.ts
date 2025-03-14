import { useState, useCallback, useEffect } from "react";
import { EventProps } from "../types";
import { getNewDate } from "../Utils/calendarNavigation";

const useDataSourceEvents = (dataSourcePlugins: any, localeConfig: any, currentDate: Date) => {
  const [dataSourceEvents, setDataSourceEvents] = useState<EventProps[]>([]);
  const [isDataSourceLoading, setIsDataSourceLoading] = useState(false);
  const [dataSourceError, setDataSourceError] = useState<string | null>(null);

  const fetchEventsFromDataSources = useCallback(
    async (startDate: Date, endDate: Date) => {
      setIsDataSourceLoading(true);
      setDataSourceError(null);
      const fetchedEvents: EventProps[] = [];
      for (const plugin of dataSourcePlugins) {
        try {
          const eventsFromSource = await plugin.fetchEvents(startDate, endDate, localeConfig);
          fetchedEvents.push(...eventsFromSource);
        } catch (error: any) {
          console.error(`Error fetching events from ${plugin.name}:`, error);
          setDataSourceError(`Error fetching events from ${plugin.name}: ${error.message}`);
        }
      }
      setDataSourceEvents(fetchedEvents);
      setIsDataSourceLoading(false);
    },
    [dataSourcePlugins, localeConfig]
  );

  useEffect(() => {
    const startDate = getNewDate(currentDate, localeConfig.defaultView, -1);
    const endDate = getNewDate(currentDate, localeConfig.defaultView, 1);
    fetchEventsFromDataSources(startDate, endDate);
  }, [currentDate, localeConfig.defaultView, fetchEventsFromDataSources]);

  return { dataSourceEvents, isDataSourceLoading, dataSourceError };
};

export default useDataSourceEvents;
