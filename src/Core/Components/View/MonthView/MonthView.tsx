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
} from "date-fns";
import { ensureDate, expandRecurringEvents } from "../../../../Utils/DateTrannforms";
import ResourceView from "../../Resource/ResourceView";
import { EventProps, MonthViewProps } from "../../../../types";
import { CalendarDay } from "./CalendarDay";
import { TZDate } from "@date-fns/tz";
import { getLocale } from "../../../../Utils/locate";
import "./../../../../css/MonthView.css";

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
}: MonthViewProps) => {
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

            // Converte as strings para uma instância de TZDate (se timeZone for informado)
            const startDate = ensureDate(normalizedEvent.start, config?.timeZone);
            const endDate = ensureDate(normalizedEvent.end, config?.timeZone);

            if (!isValid(startDate) || !isValid(endDate)) {
              console.error("Data inválida no evento:", event);
              return null;
            }

            if (
              !normalizedEvent.resources &&
              event.resourceIds &&
              Array.isArray(event.resourceIds) &&
              resources.length > 0
            ) {
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
    [resources, config?.timeZone]
  );

  const expandedEvents: EventProps[] = useMemo(() => {
    try {
      // Cria o início e fim do mês usando TZDate
      const monthStart = startOfMonth(new TZDate(currentDate, config?.timeZone));
      const monthEnd = endOfMonth(new TZDate(currentDate, config?.timeZone));

      const viewStart = addDays(monthStart, -7);
      const viewEnd = addDays(monthEnd, 7);

      const normalizedEvents = normalizeEvents(events);

      if (normalizedEvents.length > 0) {
        return expandRecurringEvents(normalizedEvents, viewStart, viewEnd, config?.timeZone);
      }
      return [];
    } catch (error) {
      console.error("Erro ao expandir eventos:", error);
      return [];
    }
  }, [events, resources, currentDate, normalizeEvents, config?.timeZone]);

  const generateMonthGrid = useCallback(() => {
    // Gera a grade mensal com base em TZDate
    const monthStart = startOfMonth(new TZDate(currentDate, config?.timeZone));
    const monthEnd = endOfMonth(new TZDate(currentDate, config?.timeZone));
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
  }, [currentDate, config?.timeZone]);

  const handleDragStart = (event: any) => {
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

  const handleDragOver = (event: any) => {
    const { over } = event;
    if (over && over.id && typeof over.id === "string" && over.id.match(/^\d{4}-\d{2}-\d{2}$/)) {
      setCurrentDropTarget(over.id);
    } else {
      setCurrentDropTarget(null);
    }
  };

  const handleDragEnd = (event: any) => {
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

      // Cria novas instâncias TZDate para newStart e newEnd
      const newStartDate = addDays(newDate, -dragOffset);
      const newStart = new TZDate(newStartDate, config?.timeZone);
      const newEndDate = addDays(newStart, duration);
      const newEnd = new TZDate(newEndDate, config?.timeZone);

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

      const updatedEvent = updatedEvents.find((ev) => ev.id === eventId);

      if (typeof onEventClick === "function") {
        if (Math.abs(delta.y) < 1) {
          onEventClick(updatedEvent);
          return;
        }
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
        <div className="react-agenfy-monthview-container">
          <div className="react-agenfy-monthview-header">
            {eachDayOfInterval({
              start: startOfWeek(new TZDate(currentDate, config?.timeZone)),
              end: addDays(startOfWeek(new TZDate(currentDate, config?.timeZone)), 6),
            }).map((day) => (
              <div
                key={format(day, "EEEEEE", { locale: getLocale(config?.lang) })}
                className="react-agenfy-monthview-day-label"
              >
                {format(day, "EEEEEE", { locale: getLocale(config?.lang) })}
              </div>
            ))}
          </div>
          <div className="react-agenfy-monthview-grid-container">
            {weeks.map((week: Date[], weekIndex: number) => (
              <div key={weekIndex} className="react-agenfy-monthview-week-row">
                {week.map((day: Date, dayIndex: number) => {
                  return (
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
                      isDropTarget={
                        day ? format(day, "yyyy-MM-dd") === currentDropTarget : false
                      }
                      config={config}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </DndContext>
    </div>
  );
};

export default MonthView;
