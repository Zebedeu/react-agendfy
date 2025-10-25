import React, { useRef, useEffect, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  differenceInDays,
  endOfDay,
  format,
  isSameDay,
  isWithinInterval,
  startOfDay,
} from "date-fns";
import { EventItem } from "./EventItem";
import { TZDate } from "@date-fns/tz";
import { ensureDate } from "../../../Utils/DateTrannforms";
import { CalendarDayProps, Resource } from "../../../types";

export const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  events = [],
  onDayClick,
  onEventClick,
  onEventResize,
  config,
  onMouseDown,
  onMouseMove,
  isSelected,
}) => {
  const dayRef = useRef<HTMLDivElement>(null);
  const [dayWidth, setDayWidth] = useState(0);

  const droppableId = day ? day.toISOString() : "disabled";
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    disabled: !day,
  });

  useEffect(() => {
    if (dayRef.current) setDayWidth(dayRef.current.offsetWidth);
  }, [dayRef.current]);

  if (!day) {
    return <div className="react-agenfy-calendar-day-empty" />;
  }

  const dayEvents = events.filter((event) => {
    try {
      const eventStart = ensureDate(event.start, config?.timeZone);
      const eventEnd = ensureDate(event.end, config?.timeZone);
      return isWithinInterval(day, {
        start: startOfDay(eventStart),
        end: endOfDay(eventEnd),
      });
    } catch (error) {
      console.error("Erro ao verificar evento para o dia:", error, event);
      return false;
    }
  });

  const sortedEvents = [...dayEvents].sort((a, b) => {
    const timeA = ensureDate(a.start, config?.timeZone);
    const timeB = ensureDate(b.start, config?.timeZone);
    if (timeA < timeB) return -1;
    if (timeA > timeB) return 1;

    const durationA = differenceInDays(
      ensureDate(a.end, config?.timeZone),
      ensureDate(a.start, config?.timeZone)
    );
    const durationB = differenceInDays(
      ensureDate(b.end, config?.timeZone),
      ensureDate(b.start, config?.timeZone)
    );
    return durationA - durationB;
  });

  const MAX_VISIBLE_EVENTS = 3;
  const visibleEvents = sortedEvents.slice(0, MAX_VISIBLE_EVENTS);
  const hiddenEventsCount = Math.max(0, sortedEvents.length - MAX_VISIBLE_EVENTS);
  const isToday = isSameDay(day, new TZDate(new Date(), config?.timeZone));

  const dayClasses = [
    "react-agenfy-calendar-day",
    isToday && "react-agenfy-calendar-day-today",
    isOver && "react-agenfy-calendar-day-droppable-over",
    isSelected && "react-agenfy-calendar-day-selected"
  ].filter(Boolean).join(" ");

  return (
    <div
      ref={(node) => { setNodeRef(node); dayRef.current = node; }}
      onMouseDown={() => onMouseDown?.(day)}
      onMouseMove={() => onMouseMove?.(day)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onDayClick?.(day); } }}
      onClick={(e) => { e.stopPropagation(); onDayClick?.(day); }}
      className={dayClasses}
      role="button"
      tabIndex={0}
      aria-label={format(day, "d MMMM yyyy")}
    >
      <div className="react-agenfy-calendar-day-header">
        <span className={`react-agenfy-day-number ${isToday ? "react-agenfy-day-number-today" : ""}`}>
          {format(day, "d")}
        </span>
        {hiddenEventsCount > 0 && (
          <span
            role="button"
            aria-label={`More ${hiddenEventsCount} events`}
            className="react-agenfy-hidden-events"
            onClick={(e) => {
              e.stopPropagation();
              const eventsInfo = sortedEvents
                .slice(MAX_VISIBLE_EVENTS)
                .map((ev) => {
                  const resourcesInfo =
                    ev.resources && ev.resources.length > 0
                      ? ` [${ev.resources.map((r: Resource) => r.name).join(", ")}]`
                      : "";
                  return `${ev.title} (${format(ensureDate(ev.start, config?.timeZone), "HH:mm")})${resourcesInfo}`;
                })
                .join("\n");
              alert(`More ${hiddenEventsCount} events:\n${eventsInfo}`);
            }}
          >
            +{hiddenEventsCount}
          </span>
        )}
      </div>
      <div className="react-agenfy-day-events">
        {visibleEvents.map((event) => {
          const eventStart = ensureDate(event.start, config?.timeZone);
          const eventEnd = ensureDate(event.end, config?.timeZone);

          const isEventStart = isSameDay(eventStart, day);
          const isEventEnd = isSameDay(eventEnd, day);

          return (
            <EventItem
              key={`${event.id}-${day.toISOString()}`}
              event={event}
              isMultiDay={event.isMultiDay}
              isStart={isEventStart}
              isEnd={isEventEnd}
              onEventResize={onEventResize}
              onEventClick={onEventClick}
              dayWidth={dayWidth}
              config={config}
            />
          );
        })}
      </div>
    </div>
  );
};
