import React, { useCallback, useMemo, useRef } from "react";
import { DndContext, pointerWithin } from "@dnd-kit/core";
import {
  format,
  parseISO,
  addMinutes,
  differenceInMinutes,
  isValid,
  startOfDay,
  endOfDay,
  addDays,
  setHours,
  setMinutes,
  startOfWeek,
} from "date-fns";
import { rrulestr } from "rrule";
import { ensureDate } from "../../../../Utils/DateTrannforms";
import {  EventProps, WeekProps } from "../../../../types";
import { TZDate } from "@date-fns/tz";
import { DayColumn } from "./DayColumn";
import { calculateRedLineOffset } from "../../../../Utils/calculateRedLineOffset";


 const WeekView = ({
  events,
  onEventUpdate,
  onEventClick,
  onDayClick,
  onEventResize,
  onSlotClick,
  currentDate,
  slotMin = "0",
  slotMax = "24",
  config,
}: WeekProps) => {
  // Configura os horários de início e fim do calendário
  const startHour = parseInt(slotMin, 10);
  const endHour = parseInt(slotMax, 10);

  const numberOfSlots = ((endHour - startHour) * 60) / config?.slotDuration!;
  if (isNaN(numberOfSlots) || numberOfSlots <= 0) {
    return (
      <div>
        {config?.slotDuration} de tempo inválido. Certifique-se de que a hora final seja maior que a hora inicial e que sejam horas válidas.
      </div>
    );
  }

  const currentWeekStart = startOfWeek(new TZDate(currentDate, config?.timeZone), { weekStartsOn: 0 });
   const daysOfWeek = useMemo(() => Array.from({ length: 7 }, (_, i) => i), []);
  const timeSlots = useMemo(() => Array.from({ length: numberOfSlots }, (_, i) => i), [numberOfSlots]);

  const draggedEventRef = useRef(null);


  const handleDragStart = (event: any) => {
    const { active } = event;
    if (active?.id) {
      draggedEventRef.current = events.find((e: EventProps) => e.id === active.id);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over, delta } = event;
    draggedEventRef.current = null;
    if (!active?.id || !over?.id) return;

    const slotTimeStr = over.id;
    if (!slotTimeStr?.match(/^\d{4}-.*$/)) return;

    const baseTime = new TZDate(parseISO(slotTimeStr), config?.timeZone);
    if (!isValid(baseTime)) return;

    const additionalMinutes = active.transform ? (active.transform.y / 40) * config?.slotDuration! : 0;
    const newStartTime = addMinutes(baseTime, additionalMinutes);

    const draggedEvent = events.find((ev: EventProps) => ev.id === active.id);
    if (!draggedEvent) return;

    const duration = differenceInMinutes(ensureDate(draggedEvent.end, config?.timeZone), ensureDate(draggedEvent.start, config?.timeZone));
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
  };

  // Função getEvents para a grade de horários – exclui eventos all-day ou multi-day
  const getEvents = useCallback(
    (slotTime: string) => {
      const slotDate = new TZDate(slotTime, config?.timeZone); // Use TZDate for slotDate
      const slotDateFormatted = format(slotDate, "yyyy-MM-dd HH:mm");
      return events.reduce((acc: EventProps[], event: EventProps) => {
        if (event.recurrence) {
          try {
            const rule = rrulestr(event.recurrence);
            const occurrences = rule.between(startOfDay(slotDate), endOfDay(slotDate), true);
            occurrences.forEach((occurrence) => {
              // Usar TZDate para occurrenceStart e occurrenceEnd diretamente com o timezone correto
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
                  recurring: true,
                });
              }
            });
          } catch (error) {
            console.error("Error parsing recurrence rule:", error);
          }
          return acc;
        }
        // Exclui eventos all-day ou multi-day desta função
        if (event.isMultiDay || event.isAllDay) return acc;
        if (format(new TZDate(ensureDate(event.start), config?.timeZone), "yyyy-MM-dd HH:mm") === slotDateFormatted) {
          acc.push(event);
        }
        return acc;
      }, []);
    },
    [events, config?.timeZone]
  );

  
  const redLineOffset = calculateRedLineOffset(
    currentDate,
    parseInt(slotMin, 10),
    config?.slotDuration || 30,
    config?.timeZone
  );
  const isDraggable = typeof onEventUpdate === "function";

  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart} collisionDetection={pointerWithin}>
      <div className="flex flex-col w-full">
        {/* Área All-Day */}
        <div className="flex border-b border-gray-200">
          <div className="w-16 bg-gray-50 border-r border-gray-200">
            <div className="h-12 flex items-center justify-center text-xs text-gray-500">{config?.all_day}</div>
          </div>
          {daysOfWeek.map((dayIndex) => {
            const dayDate = addDays(currentWeekStart, dayIndex);
            
            // Filtra eventos all-day (ou multi-day) para o dia corrente
            const allDayEvents = events.filter((event: EventProps) => {
              if (!event.isMultiDay && !event.isAllDay) return false;
              const eventStart = ensureDate(event.start, config?.timeZone);
              const eventEnd = ensureDate(event.end, config?.timeZone);
              return dayDate >= startOfDay(eventStart) && dayDate <= endOfDay(eventEnd);
            });
            return (
              <div key={dayIndex} className="flex-1 border-r border-gray-300 p-1">
                {allDayEvents.map((event) => (
                  <div key={event.id} style={{backgroundColor: event.color}} className="text-blue-100 text-xs p-1 mb-1 rounded">
                    {event.title || "Event"}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        {/* Área do Grid de Horários */}
        <div className="flex w-full border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="w-16 bg-gray-50 border-r border-gray-200">
            <div className="h-12 border-b border-gray-200" />
            {timeSlots.map((index) => (
              <div key={`hour-${index}`} className="h-10 flex items-center justify-end pr-2 text-xs text-gray-500">
                {format(
                  setMinutes(
                    setHours(startOfDay(new TZDate(currentDate, config?.timeZone)), startHour + Math.floor((index * config?.slotDuration!) / 60)), // Usar currentDate em vez de new Date()
                    (index * config?.slotDuration!) % 60
                  ),
                  "HH:mm"
                )}
              </div>
            ))}
          </div>
          {daysOfWeek.map((dayIndex) => {
            const dayDate = addDays(currentWeekStart, dayIndex);

return (
              <div
                key={dayIndex}
                className={`flex-1 relative ${dayIndex < daysOfWeek.length - 1 ? "border-r border-gray-300" : ""}`}
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
            )})};
          
        </div>
      </div>
    </DndContext>
  );
};

export default WeekView;