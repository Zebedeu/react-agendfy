import React, { useCallback, useMemo, useRef, useState } from 'react';
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
  isSameDay,
  startOfWeek,
} from "date-fns";
import { RRule, rrulestr } from "rrule";
import { ensureDate } from "../../Utils/DateTrannforms";
import { EventProps, WeekProps } from "../../types/types";
import { TZDate } from "@date-fns/tz";
import { DayColumn } from "./Components/DayColumn";
import { calculateRedLineOffset } from "../../Utils/calculateRedLineOffset";
import { useMediaQuery } from '../../hooks/useMediaQuery';

const WeekView = ({
  events,
  onEventUpdate,
  onEventClick,
  onEventResize,
  onSlotClick,
  currentDate,
  onDateRangeSelect,
  slotMin = "0",
  slotMax = "24",
  config,
}: WeekProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);

  const startHour = parseInt(slotMin, 10);
  const endHour = parseInt(slotMax, 10);
  const slotDuration = config?.slotDuration || 30;

  const numberOfSlots = useMemo(
    () => ((endHour - startHour) * 60) / slotDuration,
    [startHour, endHour, slotDuration]
  );
  if (isNaN  (numberOfSlots) || numberOfSlots <= 0) {
    return (
      <div className="react-agenfy-weekview-error">
        {config?.slotDuration} de tempo inválido. Certifique-se de que a hora final seja maior que a hora inicial e que sejam horas válidas.
      </div>
    );
  }

  const currentWeekStart = useMemo(
    () => startOfWeek(new TZDate(currentDate, config?.timeZone), { weekStartsOn: 0 }),
    [currentDate, config?.timeZone]
  );

  const daysOfWeek = useMemo(() => {
    return isMobile ? [currentDate.getDay()] : Array.from({ length: 7 }, (_, i) => i);
  }, [isMobile, currentDate]);

  const timeSlots = useMemo(() => Array.from({ length: numberOfSlots }, (_, i) => i), [numberOfSlots]);

  const timeslotLabels = useMemo(() => {
    return timeSlots.map((index) => {
      const minutes = index * slotDuration;
      const hour = startHour + Math.floor(minutes / 60);
      const minute = minutes % 60;
      const time = setMinutes(setHours(startOfDay(new TZDate(currentDate, config?.timeZone)), hour), minute);
      return format(time, "HH:mm");
    });
  }, [timeSlots, currentDate, config?.timeZone, startHour, slotDuration]);

  const redLineOffset = useMemo(
    () => calculateRedLineOffset(currentDate, startHour, slotDuration, config?.timeZone),
    [currentDate, startHour, slotDuration, config?.timeZone]
  );

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

  const draggedEventRef = useRef<EventProps | null>(null);

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

    if (Math.abs(delta.y) < 1) {
      onEventClick?.(draggedEvent);
      return;
    }

    const updatedEvent = {
      ...draggedEvent,
      start: newStartTime.toISOString(),
      end: addMinutes(newStartTime, duration).toISOString(),
    };

    if (typeof onEventUpdate === "function") {
      onEventUpdate(updatedEvent);
    }
  }, [events, config?.timeZone, slotDuration, onEventClick, onEventUpdate]);

  const handleSelectionMouseDown = useCallback((slotTime: Date) => {
    if (!slotTime) return;
    setIsSelecting(true);
    setSelectionStart(slotTime);
    setSelectionEnd(slotTime);
  }, []);

  const handleSelectionMouseMove = useCallback((slotTime: Date) => {
    if (isSelecting && slotTime) {
      setSelectionEnd(slotTime);
    }
  }, [isSelecting]);

  const handleSelectionMouseUp = useCallback(() => {
    if (isSelecting && selectionStart && selectionEnd && onDateRangeSelect) {
    const start = selectionStart < selectionEnd ? selectionStart : selectionEnd;
    const end = selectionStart > selectionEnd ? selectionStart : selectionEnd;
    const finalEnd = addMinutes(end, slotDuration);

    onDateRangeSelect({
      start: start.toISOString(),
      end: finalEnd.toISOString(),
      isMultiDay: !isSameDay(start, end),
    });
    }
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  }, [isSelecting, selectionStart, selectionEnd, onDateRangeSelect, slotDuration]);

  const isSlotSelected = useCallback((slotTime: Date) => {
    if (!isSelecting || !selectionStart || !selectionEnd || !slotTime) return false;
    const start = selectionStart < selectionEnd ? selectionStart : selectionEnd;
    const end = selectionStart > selectionEnd ? selectionStart : selectionEnd;
    return slotTime >= start && slotTime <= end;
  }, [isSelecting, selectionStart, selectionEnd]);

  const getEvents = useCallback((slotTime: string) => {
    const slotDate = new TZDate(slotTime, config?.timeZone);
    const slotDateFormatted = format(slotDate, "yyyy-MM-dd HH:mm");
    return events.reduce((acc: EventProps[], event: EventProps) => {
      if (event.recurrence) {
        try {
          const eventStart = new TZDate(ensureDate(event.start), config?.timeZone);
          const eventEnd = new TZDate(ensureDate(event.end), config?.timeZone);

          // Ajusta o DTSTART da regra para o fuso horário local do sistema, pois rrule trabalha com datas locais.
          const localStart = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate(), eventStart.getHours(), eventStart.getMinutes(), eventStart.getSeconds());
          const ruleOptions = rrulestr(event.recurrence, { forceset: true }).options;
          ruleOptions.dtstart = localStart;

          const rule = new RRule(ruleOptions);

          // Gera ocorrências no fuso horário local e as converte de volta para o fuso do calendário.
          const occurrences = rule.between(startOfDay(slotDate), endOfDay(slotDate), true).map(d => new TZDate(d, config?.timeZone));

          occurrences.forEach((occurrence) => {
            const occurrenceStart = setMinutes(
              setHours(occurrence, eventStart.getHours()),
              eventStart.getMinutes()
            );
            const occurrenceEnd = addMinutes(
              occurrenceStart,
              differenceInMinutes(eventEnd, eventStart)
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
        <div 
          className="react-agenfy-weekview-timeslot-grid"
          onMouseUp={handleSelectionMouseUp}
          onMouseLeave={handleSelectionMouseUp}
        >
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
                  onSelectionMouseDown={handleSelectionMouseDown}
                  onSelectionMouseMove={handleSelectionMouseMove}
                  isSlotSelected={isSlotSelected}
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