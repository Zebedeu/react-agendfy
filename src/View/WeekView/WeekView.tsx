import React, { useCallback, useMemo, useRef } from "react";
import { DndContext, pointerWithin } from "@dnd-kit/core";
import {
  format,
  addMinutes,
  differenceInMinutes,
  isValid,
  addDays,
  setHours,
  setMinutes,
  startOfDay,
  endOfDay,
  startOfWeek,
} from "date-fns";
import { rrulestr } from "rrule";
import { ensureDate } from "../../Utils/DateTrannforms";
import { EventProps, WeekProps } from "../../types";
import { TZDate } from "@date-fns/tz";
import { DayColumn } from "./Components/DayColumn";
import { calculateRedLineOffset } from "../../Utils/calculateRedLineOffset";

// Main WeekView component with performance optimizations
const WeekView = ({
  events,
  onEventUpdate,
  onEventClick,
  onEventResize,
  onSlotClick,
  currentDate,
  slotMin = "0",
  slotMax = "24",
  config,
}: WeekProps) => {
  const startHour = parseInt(slotMin, 10);
  const endHour = parseInt(slotMax, 10);
  const slotDuration = config?.slotDuration || 30;

  // Calculate number of slots (memoized)
  const numberOfSlots = useMemo(
    () => ((endHour - startHour) * 60) / slotDuration,
    [startHour, endHour, slotDuration]
  );
  if (isNaN(numberOfSlots) || numberOfSlots <= 0) {
    return (
      <div className="react-agenfy-weekview-error">
        {config?.slotDuration} de tempo inválido. Certifique-se de que a hora final seja maior que a hora inicial e que sejam horas válidas.
      </div>
    );
  }

  // Memoize the start of the current week
  const currentWeekStart = useMemo(
    () => startOfWeek(new TZDate(currentDate, config?.timeZone), { weekStartsOn: 0 }),
    [currentDate, config?.timeZone]
  );

  // Array of day indices (0 to 6)
  const daysOfWeek = useMemo(() => Array.from({ length: 7 }, (_, i) => i), []);

  // Generate time slot indices
  const timeSlots = useMemo(() => Array.from({ length: numberOfSlots }, (_, i) => i), [numberOfSlots]);

  // Precompute timeslot labels
  const timeslotLabels = useMemo(() => {
    return timeSlots.map((index) => {
      const time = setMinutes(
        setHours(
          startOfDay(new TZDate(currentDate, config?.timeZone)),
          startHour + Math.floor((index * slotDuration) / 60)
        ),
        (index * slotDuration) % 60
      );
      return format(time, "HH:mm");
    });
  }, [timeSlots, currentDate, config?.timeZone, startHour, slotDuration]);

  // Precompute red line offset
  const redLineOffset = useMemo(
    () => calculateRedLineOffset(currentDate, startHour, slotDuration, config?.timeZone),
    [currentDate, startHour, slotDuration, config?.timeZone]
  );

  // Memoize all-day events mapping for the week
  const allDayEventsByDay = useMemo(() => {
    const mapping: { [key: number]: EventProps[] } = {};
    daysOfWeek.forEach((dayIndex) => {
      const dayDate = addDays(currentWeekStart, dayIndex);
      mapping[dayIndex] = events.filter((event: EventProps) => {
        if (!event.isMultiDay && !event.isAllDay) return false;
        const eventStart = ensureDate(event.start, config?.timeZone);
        const eventEnd = ensureDate(event.end, config?.timeZone);
        return dayDate >= startOfDay(eventStart) && dayDate <= endOfDay(eventEnd);
      });
    });
    return mapping;
  }, [daysOfWeek, currentWeekStart, events, config?.timeZone]);

  // useRef to store the dragged event
  const draggedEventRef = useRef<EventProps | null>(null);

  // Handlers for drag and drop events
  const handleDragStart = useCallback((event: any) => {
    const { active } = event;
    if (active?.id) {
      draggedEventRef.current = events.find((e: EventProps) => e.id === active.id) || null;
    }
  }, [events]);

  const handleDragEnd = useCallback((event: any) => {
    const { active, over, delta } = event;
    draggedEventRef.current = null;
    if (!active?.id || !over?.id) return;

    const baseTime = new TZDate(new Date(over.id), config?.timeZone);
    if (!isValid(baseTime)) return;

    const additionalMinutes = active.transform ? (active.transform.y / 40) * slotDuration : 0;
    const newStartTime = addMinutes(baseTime, additionalMinutes);

    const draggedEvent = events.find((ev: EventProps) => ev.id === active.id);
    if (!draggedEvent) return;

    const duration = differenceInMinutes(
      ensureDate(draggedEvent.end, config?.timeZone),
      ensureDate(draggedEvent.start, config?.timeZone)
    );
    const updatedEvent = {
      ...draggedEvent,
      start: newStartTime.toISOString(),
      end: addMinutes(newStartTime, duration).toISOString(),
    };

    if (Math.abs(delta.y) < 1) {
      onEventClick?.(updatedEvent);
      return;
    }
    if (typeof onEventUpdate === "function") {
      onEventUpdate(updatedEvent);
    }
  }, [events, config?.timeZone, slotDuration, onEventClick, onEventUpdate]);

  // getEvents callback: filter events for a given slot time (with recurrence support)
  const getEvents = useCallback((slotTime: string) => {
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
              differenceInMinutes(
                new TZDate(ensureDate(event.end), config?.timeZone),
                new TZDate(ensureDate(event.start), config?.timeZone)
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
      if (event.isMultiDay || event.isAllDay) return acc;
      if (format(new TZDate(ensureDate(event.start), config?.timeZone), "yyyy-MM-dd HH:mm") === slotDateFormatted) {
        acc.push(event);
      }
      return acc;
    }, []);
  }, [events, config?.timeZone]);

  const isDraggable = useMemo(() => typeof onEventUpdate === "function", [onEventUpdate]);

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      collisionDetection={pointerWithin}
    >
      <div className="react-agenfy-weekview-container">
        {/* All-Day Area */}
        <div className="react-agenfy-weekview-all-day">
          <div className="react-agenfy-weekview-all-day-label">
            <div className="react-agenfy-weekview-all-day-text">{config?.all_day}</div>
          </div>
          {daysOfWeek.map((dayIndex) => {
            const dayDate = addDays(currentWeekStart, dayIndex);
            const dayAllDayEvents = allDayEventsByDay[dayIndex] || [];
            return (
              <div key={dayIndex} className="react-agenfy-weekview-all-day-column">
                {dayAllDayEvents.map((event) => (
                  <div
                    key={event.id}
                    style={{ backgroundColor: event.color }}
                    className="react-agenfy-weekview-all-day-event"
                  >
                    {event.title || "Event"}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        {/* Timeslot Grid Area */}
        <div className="react-agenfy-weekview-timeslot-grid">
          <div className="react-agenfy-weekview-timeslot-label">
            <div className="react-agenfy-weekview-timeslot-label-top" />
            {timeslotLabels.map((label, index) => (
              <div key={`hour-${index}`} className="react-agenfy-weekview-timeslot">
                {label}
              </div>
            ))}
          </div>
          {daysOfWeek.map((dayIndex) => {
            const dayDate = addDays(currentWeekStart, dayIndex);
            return (
              <div
                key={dayIndex}
                className={`react-agenfy-weekview-day-column ${dayIndex < daysOfWeek.length - 1 ? "react-agenfy-border-right" : ""}`}
              >
                <DayColumn
                  dayDate={dayDate}
                  events={events}
                  timeSlots={timeSlots}
                  parsedSlotMin={startHour}
                  parsedSlotMax={endHour}
                  onEventClick={onEventClick}
                  onEventResize={onEventResize}
                  onSlotClick={onSlotClick}
                  getEvents={getEvents}
                  redLineOffset={redLineOffset}
                  config={config}
                  isDraggable={isDraggable}
                />
              </div>
            );
          })}
        </div>
      </div>
    </DndContext>
  );
};

export default WeekView;
