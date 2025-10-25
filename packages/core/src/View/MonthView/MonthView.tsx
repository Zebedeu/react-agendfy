import React, { useCallback, useState, useMemo } from 'react';
import {
  format,
  isValid,
  addDays,
  getDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
} from "date-fns";
import { isSameDay } from "date-fns";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { ensureDate, expandRecurringEvents } from "../../Utils/DateTrannforms";
import ResourceView from "../../Components/Resource/ResourceView";
import { EventProps, MonthViewProps } from "../../types";
import { CalendarDay } from "./Components/CalendarDay";
import { TZDate } from "@date-fns/tz";
import { getLocale } from "../../Utils/locate";
import { EventItem } from "./Components/EventItem";

const MonthView = ({
  events = [],
  resources = [],
  currentDate = new TZDate(new Date(), config?.timeZone),
  onEventUpdate,
  onEventResize,
  onDayClick,
  onEventClick,
  config,
  onDateRangeSelect,
  showResourceView = false,
}: MonthViewProps) => {
  const [activeEvent, setActiveEvent] = useState<EventProps | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);

  const handleDragStart = useCallback((event) => setActiveEvent(event.active.data.current.event), []);

  const handleDragEnd = useCallback(
    ({ active, over }) => {
      setActiveEvent(null);

      if (active && over && onEventUpdate) {
        const originalEvent = active.data.current.event as EventProps;
        const targetDateStr = over.id as string; // ID do CalendarDay (ex: '2023-01-20T00:00:00.000Z')

        const newStartDate = new Date(targetDateStr);
        const originalStartDate = ensureDate(originalEvent.start, config?.timeZone);

        if (isSameDay(newStartDate, originalStartDate)) {
          return;
        }

        newStartDate.setHours(originalStartDate.getHours());
        newStartDate.setMinutes(originalStartDate.getMinutes());

        const duration = ensureDate(
          originalEvent.end,
          config?.timeZone
        ).getTime() - originalStartDate.getTime();
        const newEndDate = new Date(newStartDate.getTime() + duration);

        onEventUpdate({
          ...originalEvent,
          start: newStartDate.toISOString(),
          end: newEndDate.toISOString(),
        });
      }
    },
    [onEventUpdate, config?.timeZone]
  );

  const normalizeEvents = useCallback(
    (eventsArray: EventProps[]) => {
      return (eventsArray || [])
        .map((event: EventProps) => {
          let normalizedEvent: EventProps = { ...event };

          try {
            if (typeof event.start === "string") {
              normalizedEvent.start = event.start
                ? event.start : new Date().toISOString();
            }

            const startDate = ensureDate(normalizedEvent.start, config?.timeZone || 'UTC');
            const endDate = ensureDate(normalizedEvent.end, config?.timeZone || 'UTC');

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

  const weeks = generateMonthGrid();

  const handleMouseDown = (day: Date) => {
    if (!day) return;
    setIsSelecting(true);
    setSelectionStart(day);
    setSelectionEnd(day);
  };

  const handleMouseMove = (day: Date) => {
    if (isSelecting && day) {
      setSelectionEnd(day);
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && selectionStart && selectionEnd && onDateRangeSelect) {
      const start = selectionStart < selectionEnd ? selectionStart : selectionEnd;
      const end = selectionStart > selectionEnd ? selectionStart : selectionEnd;
      onDateRangeSelect({
        start: start.toISOString(),
        end: end.toISOString(),
        isMultiDay: !isSameDay(start, end),
      });
    }
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  const isDaySelected = (day: Date) => {
    if (!isSelecting || !selectionStart || !selectionEnd || !day) {
      return false;
    }
    const start = selectionStart < selectionEnd ? selectionStart : selectionEnd;
    const end = selectionStart > selectionEnd ? selectionStart : selectionEnd;
    return day >= start && day <= end;
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <>
        {showResourceView && resources.length > 0 && (
          <ResourceView
            resources={resources}
            events={expandedEvents}
            currentDate={currentDate}
          />
        )}

        <div className="react-agenfy-monthview-container" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
          <div className="react-agenfy-monthview-header">
            {eachDayOfInterval({
              start: startOfWeek(new TZDate(currentDate, config?.timeZone)),
              end: addDays(
                startOfWeek(new TZDate(currentDate, config?.timeZone)),
                6
              ),
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
                {week.map((day: Date, dayIndex: number) => (
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
                    onEventClick={onEventClick}
                    config={config}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    isSelected={isDaySelected(day)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <DragOverlay>
          {activeEvent ? <EventItem event={activeEvent} isDragging /> : null}
        </DragOverlay>
      </>
    </DndContext>
  );
};

export default MonthView;
