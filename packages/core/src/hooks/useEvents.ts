import { useCallback, useMemo } from "react";
import { format, addDays, setHours, setMinutes, startOfDay, endOfDay, addMinutes, differenceInMinutes } from "date-fns";
import { rrulestr } from "rrule";
import { TZDate } from "@date-fns/tz";
import { EventProps } from "../types";
import { ensureDate } from "../Utils/DateTrannforms";

export const useEvents = ({ events, daysOfWeek, currentWeekStart, timeZone }) => {
  // Memoize all-day events mapping for the week
  const allDayEventsByDay = useMemo(() => {
    const mapping = {};
    daysOfWeek.forEach((dayIndex) => {
      const dayDate = addDays(currentWeekStart, dayIndex);
      mapping[dayIndex] = events.filter((event) => {
        if (!event.isMultiDay && !event.isAllDay) return false;
        const eventStart = ensureDate(event.start, timeZone);
        const eventEnd = ensureDate(event.end, timeZone);
        return dayDate >= startOfDay(eventStart) && dayDate <= endOfDay(eventEnd);
      });
    });
    return mapping;
  }, [daysOfWeek, currentWeekStart, events, timeZone]);

  // getEvents callback: filter events for a given slot time (with recurrence support)
  const getEvents = useCallback((slotTime) => {
    const slotDate = new TZDate(slotTime, timeZone);
    const slotDateFormatted = format(slotDate, "yyyy-MM-dd HH:mm");
    
    return events.reduce((acc, event) => {
      // Handle recurring events
      if (event.recurrence) {
        try {
          const rule = rrulestr(event.recurrence);
          const occurrences = rule.between(startOfDay(slotDate), endOfDay(slotDate), true);
          
          occurrences.forEach((occurrence) => {
            const occurrenceStart = setMinutes(
              setHours(
                new TZDate(occurrence, timeZone), 
                new TZDate(ensureDate(event.start), timeZone).getHours()
              ),
              new TZDate(ensureDate(event.start), timeZone).getMinutes()
            );
            
            const occurrenceEnd = addMinutes(
              occurrenceStart,
              differenceInMinutes(
                new TZDate(ensureDate(event.end), timeZone),
                new TZDate(ensureDate(event.start), timeZone)
              )
            );
            
            if (format(occurrenceStart, "yyyy-MM-dd HH:mm") === slotDateFormatted) {
              acc.push({
                ...event,
                start: occurrenceStart.toISOString(),
                end: occurrenceEnd.toISOString(),
                recurring: true,
              });
            }
          });
        } catch (error) {
          console.error("Error parsing recurrence rule:", error);
        }
        return acc;
      }
      
      // Handle single (non-recurring) events
      if (event.isMultiDay || event.isAllDay) return acc;
      
      if (format(new TZDate(ensureDate(event.start), timeZone), "yyyy-MM-dd HH:mm") === slotDateFormatted) {
        acc.push(event);
      }
      
      return acc;
    }, []);
  }, [events, timeZone]);

  return {
    allDayEventsByDay,
    getEvents
  };
};