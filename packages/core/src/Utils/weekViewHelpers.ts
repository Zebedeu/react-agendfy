import { format, startOfDay, endOfDay, addMinutes, differenceInMinutes, setHours, setMinutes, startOfWeek, addDays } from "date-fns";
import { rrulestr } from "rrule";
import { TZDate } from "@date-fns/tz";
import { EventProps } from "../types";
import { ensureDate } from "./DateTrannforms";


export const calculateNumberOfSlots = (slotMin: string, slotMax: string, slotDuration: number): number => {
  const startHour = parseInt(slotMin, 10);
  const endHour = parseInt(slotMax, 10);
  return ((endHour - startHour) * 60) / slotDuration;
};


export const getCurrentWeekStart = (currentDate: Date, timeZone: string, weekStartsOn = 0): Date => {
  return startOfWeek(new TZDate(currentDate, timeZone), { weekStartsOn });
};


export const generateDaysOfWeek = (): number[] => {
  return Array.from({ length: 7 }, (_, i) => i);
};

export const generateTimeSlots = (numberOfSlots: number): number[] => {
  return Array.from({ length: numberOfSlots }, (_, i) => i);
};


export const getEventsForSlot = (slotTime: string, events: EventProps[], config: any): EventProps[] => {
  const slotDate = new TZDate(slotTime, config?.timeZone);
  const slotDateFormatted = format(slotDate, "yyyy-MM-dd HH:mm");
  return events.reduce((acc: EventProps[], event: EventProps) => {
    if (event.recurrence) {
      try {
        const rule = rrulestr(event.recurrence);
        const occurrences = rule.between(startOfDay(slotDate), endOfDay(slotDate), true);
        occurrences.forEach((occurrence) => {
          const occurrenceStart = setMinutes(
            setHours(new TZDate(occurrence, config?.timeZone), new TZDate(ensureDate(event.start), config?.timeZone).getHours()),
            new TZDate(ensureDate(event.start), config?.timeZone).getMinutes()
          );
          const occurrenceEnd = addMinutes(
            occurrenceStart,
            differenceInMinutes(new TZDate(ensureDate(event.end), config?.timeZone), new TZDate(ensureDate(event.start), config?.timeZone))
          );
          if (format(occurrenceStart, "yyyy-MM-dd HH:mm") === slotDateFormatted) {
            acc.push({
              ...event,
              start: occurrenceStart.toISOString(),
              end: occurrenceEnd.toISOString(),
              isRecurrenceInstance: true, 
              originalEventId: event.id,
            });
          }
        });
      } catch (error) {
        console.error("Error parsing recurrence rule:", error);
      }
      return acc;
    }
    if (event.isMultiDay || event.isAllDay) return acc;
    if (format(new TZDate(ensureDate(event.start), config?.timeZone), "yyyy-MM-dd HH:mm") === slotDateFormatted) {
      acc.push(event);
    }
    return acc;
  }, []);
};