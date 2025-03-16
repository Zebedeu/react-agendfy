import React from "react";
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
  isDroppable = true,
  isDropTarget = false,
  config,
}) => {
  const dateStr = day ? format(day, "yyyy-MM-dd") : "";
  const { setNodeRef } = useDroppable({
    id: dateStr,
    disabled: !isDroppable,
  });

  // Se não houver dia, renderiza um bloco vazio
  if (!day) {
    return <div className="react-agenfy-calendar-day-empty" />;
  }

  // Filtra os eventos que ocorrem neste dia
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

  // Define a classe de background conforme a condição:
  // Se for drop target, usa verde; se for hoje, azul; se for droppable, branco; senão, cinza claro.
  let backgroundColorClass = "";
  if (isDropTarget) {
    backgroundColorClass = "react-agenfy-bg-green-200";
  } else if (isToday) {
    backgroundColorClass = "react-agenfy-bg-blue-50";
  } else {
    backgroundColorClass = isDroppable ? "react-agenfy-bg-white" : "react-agenfy-bg-gray-50";
  }

  return (
    <div
      ref={setNodeRef}
      onClick={() => onDayClick?.(day)}
      className={`react-agenfy-calendar-day ${backgroundColorClass}`}
    >
      <div className="react-agenfy-calendar-day-header">
        <span className={`react-agenfy-day-number ${isToday ? "react-agenfy-day-number-today" : ""}`}>
          {format(day, "d")}
        </span>
        {hiddenEventsCount > 0 && (
          <span
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
              alert(`Mais ${hiddenEventsCount} eventos:\n${eventsInfo}`);
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
          const isMultiDayEvent = !isSameDay(eventStart, eventEnd);
          const isEventStart = isSameDay(eventStart, day);
          const isEventEnd = isSameDay(eventEnd, day);

          return (
            <EventItem
              key={`${event.id}-${dateStr}`}
              event={event}
              isMultiDay={isMultiDayEvent}
              isStart={isEventStart}
              isEnd={isEventEnd}
              onEventResize={onEventResize}
              onEventClick={onEventClick}
              config={config}
            />
          );
        })}
      </div>
    </div>
  );
};
