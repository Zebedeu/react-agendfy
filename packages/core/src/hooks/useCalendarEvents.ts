import { useMemo, useCallback } from 'react';
import { CalendarEvent } from '../types/calendar';

export function useCalendarEvents(events: CalendarEvent[], timezone: string) {
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [events]);

  const groupedByDay = useMemo(() => {
    return sortedEvents.reduce((acc, event) => {
      const dateKey = event.start.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(event);
      return acc;
    }, {} as Record<string, CalendarEvent[]>);
  }, [sortedEvents]);

  return { sortedEvents, groupedByDay };
}