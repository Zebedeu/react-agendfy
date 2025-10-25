import React, { useCallback, useMemo, useRef, useState } from 'react';
import { DndContext, pointerWithin, closestCenter } from "@dnd-kit/core";
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
import { ensureDate } from "../../Utils/DateTrannforms";
import { EventProps, WeekProps } from "../../types";
import { TZDate } from "@date-fns/tz";
import { DayColumn } from "./Components/DayColumn";
import { calculateRedLineOffset } from "../../Utils/calculateRedLineOffset";
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { getEventsForSlot } from '../../Utils/weekViewHelpers';

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

  const parseTime = (timeStr: string | undefined) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes / 60);
  };
  const startHour = parseTime(slotMin);
  const endHour = parseTime(slotMax);
  const slotDuration = config?.slotDuration || 30;

  const numberOfSlots = useMemo(
    () => Math.floor(((endHour - startHour) * 60) / slotDuration),
    [startHour, endHour, slotDuration]
  );
  if (isNaN(numberOfSlots) || numberOfSlots <= 0) {
    return (
      <div className="react-agenfy-weekview-error">
        {config?.slotDuration} invalid time slot. Make sure the end time is greater than the start time and that they are valid hours.
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
      const time = setMinutes(
        setHours(
          startOfDay(new TZDate(currentDate, config?.timeZone)),
          Math.floor(startHour) + Math.floor(((index * slotDuration) + (startHour % 1 * 60)) / 60)
        ),
        (index * slotDuration) % 60
      );
      return format(time, "HH:mm");
    });
  }, [timeSlots, currentDate, config?.timeZone, startHour, slotDuration]);

  const redLineOffset = useMemo(
    () => calculateRedLineOffset(currentDate, startHour, slotDuration, config?.timeZone),
    [currentDate, startHour, slotDuration, config?.timeZone]
  );

  const { allDayEventsByDay, timeGridEvents } = useMemo(() => {
    const mapping: { [key: number]: EventProps[] } = {};
    const gridEvents: EventProps[] = [];

    events.forEach((event: EventProps) => {
      if (event.isAllDay || event.isMultiDay) {
        daysOfWeek.forEach((dayIndex) => {
          const dayDate = addDays(currentWeekStart, dayIndex);
          const eventStart = ensureDate(event.start, config?.timeZone);
          const eventEnd = ensureDate(event.end, config?.timeZone);
          if (dayDate >= startOfDay(eventStart) && dayDate <= endOfDay(eventEnd)) {
            if (!mapping[dayIndex]) mapping[dayIndex] = [];
            mapping[dayIndex].push(event);
          }
        });
      } else {
        gridEvents.push(event);
      }
    });
    return { allDayEventsByDay: mapping, timeGridEvents: gridEvents };
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
  }, [events, config?.timeZone, slotDuration, onEventClick, onEventUpdate]);

  const getEvents = useCallback(
    (slotTime: string) => getEventsForSlot(slotTime, timeGridEvents, config),
    [timeGridEvents, config]
  );

  const isDraggable = useMemo(() => typeof onEventUpdate === "function", [onEventUpdate]);

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      collisionDetection={closestCenter}
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