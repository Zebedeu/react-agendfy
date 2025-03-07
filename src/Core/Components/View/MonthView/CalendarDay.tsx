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
import { ensureDate } from "../../../../Utils/DateTrannforms";
import { EventItem } from "./EventItem";
import { CalendarDayProps, Resource } from "../../../../types";
import { TZDate } from "@date-fns/tz";

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
  // Como day é do tipo TZDate, podemos formatá-lo diretamente.
  const dateStr = day ? format(day, "yyyy-MM-dd") : "";

  const { setNodeRef } = useDroppable({
    id: dateStr,
    disabled: !isDroppable,
  });

  if (!day) {
    return (
      <div className="bg-gray-50 border-r border-gray-200 min-h-[120px]" />
    );
  }

  const dayEvents = events.filter((event) => {
    try {
      // Asseguramos que event.start e event.end sejam convertidos para TZDate com o fuso definido.
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

  let backgroundColor = "";
  if (isDropTarget) {
    backgroundColor = "bg-green-200";
  } else if (isToday) {
    backgroundColor = "bg-blue-50";
  } else {
    backgroundColor = isDroppable ? "bg-white" : "bg-gray-50";
  }

  return (
    <div
      ref={setNodeRef}
      onClick={() => onDayClick?.(day)}
      className={`
        min-h-[120px]
        p-2
        border-r
        border-gray-200
        transition-colors
        duration-200
        hover:bg-gray-50
        ${backgroundColor}
      `}
    >
      <div className="flex justify-between items-center mb-2">
        <span
          className={`text-sm font-medium ${isToday ? "text-blue-600 font-bold" : ""}`}
        >
          {format(day, "d")}
        </span>
        {hiddenEventsCount > 0 && (
          <span
            className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer bg-gray-100 px-1.5 py-0.5 rounded-full"
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
      <div className="space-y-1">
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
