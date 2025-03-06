import React, { useCallback, useState, useMemo } from "react";
import { DndContext, pointerWithin } from "@dnd-kit/core";
import {
  format,
  parseISO,
  isValid,
  addDays,
  getDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  differenceInDays,
  startOfWeek,
  addHours,
} from "date-fns";
import ResourceDisplay from "../../Resource/ResourceDisplay";
import { ensureDate, expandRecurringEvents } from "../../../../Utils/DateTrannforms";
import ResourceView from "../../Resource/ResourceView";
import { EventProps } from "../../../../types";
import { CalendarDay } from "./CalendarDay";


const MonthView = ({
  events = [],
  resources = [],
  currentDate = new Date(),
  onEventUpdate,
  onEventResize,
  onDayClick,
  onEventClick,
  config,
  showResourceView = false,
}) => {
  const [draggingEvent, setDraggingEvent] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [currentDropTarget, setCurrentDropTarget] = useState(null);

  const normalizeEvents = useCallback(
    (eventsArray: EventProps[]) => {
      return eventsArray
        .map((event: EventProps) => {
          let normalizedEvent: EventProps = { ...event };

          try {
            if (typeof event.start === "string") {
              normalizedEvent.start = event.start
                ? event.start
                : `${event.start}T00:00:00`;
            }

            if (typeof event.end === "string") {
              normalizedEvent.end = event.end
                ? event.end
                : `${event.end}T23:59:59`;
            }

            const startDate = parseISO(normalizedEvent.start.toLocaleString());
            const endDate = parseISO(normalizedEvent.end.toLocaleString());

            if (!isValid(startDate) || !isValid(endDate)) {
              console.error("Data inválida no evento:", event);
              return null;
            }

            if (!normalizedEvent.resources && event.resourceIds && Array.isArray(event.resourceIds) && resources.length > 0) {
              normalizedEvent.resources = event.resourceIds
                .map((id) => resources.find((r) => r.id === id))
                .filter(Boolean);
            }

            return normalizedEvent;
          } catch (error) {
            console.error("Erro ao normalizar evento:", error, event);
            return null;
          }
        })
        .filter(Boolean);
    },
    [resources]
  );

  const expandedEvents: EventProps[]= useMemo(() => {
    try {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      const viewStart = addDays(monthStart, -7);
      const viewEnd = addDays(monthEnd, 7);

      const normalizedEvents = normalizeEvents(events);

      if (normalizedEvents.length > 0) {
        return expandRecurringEvents(normalizedEvents, viewStart, viewEnd);
      }
      return [];
    } catch (error) {
      console.error("Erro ao expandir eventos:", error);
      return [];
    }
  }, [events, resources, currentDate, normalizeEvents]);

  const generateMonthGrid = useCallback(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startWeekday = getDay(monthStart);

    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const totalCells = Math.ceil((days.length + startWeekday) / 7) * 7;
    const grid = Array(totalCells).fill(null);

    days.forEach((day, index) => {
      grid[index + startWeekday] = day;
    });

    return grid.reduce((weeks, day, index) => {
      const weekIndex = Math.floor(index / 7);
      weeks[weekIndex] = weeks[weekIndex] || [];
      weeks[weekIndex].push(day);
      return weeks;
    }, []);
  }, [currentDate]);

  const handleDragStart = (event) => {
    try {
      const { active } = event;
      if (!active || !active.data.current) return;

      const eventId = active.id;
      const dragData = active.data.current;

      if (dragData.event?.isRecurrenceInstance) {
        return;
      }

      const originalEvent = events.find((ev) => ev.id === eventId);
      if (!originalEvent) return;

      let offset = 0;

      if (dragData.isMultiDay) {
        const originalStart = ensureDate(originalEvent.start, config?.timeZone);
        const clickedDate = ensureDate(dragData.event.start, config?.timeZone);

        if (dragData.isStart) {
          offset = 0;
        } else if (dragData.isEnd) {
          offset = differenceInDays(ensureDate(originalEvent.end, config?.timeZone), originalStart);
        } else {
          offset = differenceInDays(clickedDate, originalStart);
        }
      }

      setDraggingEvent(eventId);
      setDragOffset(offset);
    } catch (error) {
      console.error("Erro no handleDragStart:", error);
      setDraggingEvent(null);
      setDragOffset(0);
    }
  };

  const handleDragOver = (event) => {
    const { over } = event;
    if (over && over.id && over.id.match(/^\d{4}-\d{2}-\d{2}$/)) {
      setCurrentDropTarget(over.id);
    } else {
      setCurrentDropTarget(null);
    }
  };

  const handleDragEnd = (event) => {
    try {
      const { active, over, delta } = event;
      setDraggingEvent(null);
      setCurrentDropTarget(null);

      if (!active || !over) return;

      const eventId = active.id;
      const newDateStr = over.id;

      if (!newDateStr || !newDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return;

      const newDate = parseISO(newDateStr);
      if (!isValid(newDate)) return;

      const draggedEvent = events.find((ev) => ev.id === eventId);
      if (!draggedEvent) return;

      const originalStart = ensureDate(draggedEvent.start, config?.timeZone);
      const originalEnd = ensureDate(draggedEvent.end, config?.timeZone);
      const duration = differenceInDays(originalEnd, originalStart);

      const newStart = addDays(newDate, -dragOffset);
      const newEnd = addDays(newStart, duration);

      newStart.setHours(
        originalStart.getHours(),
        originalStart.getMinutes(),
        originalStart.getSeconds()
      );
      newEnd.setHours(
        originalEnd.getHours(),
        originalEnd.getMinutes(),
        originalEnd.getSeconds()
      );

      const updatedEvents = events.map((ev: EventProps) =>
        ev.id === eventId
          ? {
              ...ev,
              start: format(newStart, "yyyy-MM-dd HH:mm:ss"),
              end: format(newEnd, "yyyy-MM-dd HH:mm:ss"),
            }
          : ev
      );

      const updatedEvent = updatedEvents.find((ev) => ev.id === active.id);

      if (Math.abs(delta.y) < 1) {
        onEventClick(updatedEvent);
        return;
      }

      if (typeof onEventUpdate === "function") {
        onEventUpdate(updatedEvent);
      }
    } catch (error) {
      console.error("Erro no handleDragEnd:", error);
    }
  };

  const weeks = generateMonthGrid();

  return (
    <div>
      {showResourceView && resources.length > 0 && (
        <ResourceView
          resources={resources}
          events={expandedEvents}
          currentDate={currentDate}
        />
      )}
      <DndContext
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="w-full border border-gray-200 rounded-lg bg-white shadow-sm">
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {eachDayOfInterval({
              start: startOfWeek(currentDate, { locale: config } as any ),
              end: addDays(startOfWeek(currentDate, { locale: config }), 6),
            }).map((day) => (
              <div
                key={format(day, "EEEEEE", { locale: config })}
                className="p-2 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0"
              >
                {format(day, "EEEEEE", { locale: config })}
              </div>
            ))}
          </div>
          <div className="flex-1">
            {weeks.map((week, weekIndex) => (
              <div
                key={weekIndex}
                className="grid grid-cols-7 border-b border-gray-200 last:border-b-0"
              >
                {week.map((day, dayIndex) => (
                  <CalendarDay
                    key={
                      day
                        ? format(day, "yyyy-MM-dd")
                        : `empty-${weekIndex}-${dayIndex}`
                    }
                    day={day}
                    events={expandedEvents}
                    onDayClick={onDayClick}
                    onEventResize={onEventResize}
                    isDroppable={!!day}
                    onEventClick={onEventClick}
                    isDropTarget={day ? format(day, "yyyy-MM-dd") === currentDropTarget : false}
                    config={config}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </DndContext>
    </div>
  );
};

export default MonthView;
