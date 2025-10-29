// CalendarDay.tsx (Atualizado)
import React, { useRef, useEffect, useState, memo } from "react";
import { useDroppable, } from "@dnd-kit/core";
import {
  format,
  isSameDay,
  isWithinInterval,
  startOfDay,
  endOfDay,
  addMilliseconds,
  isSameMonth,
} from "date-fns";
import { TZDate } from "@date-fns/tz";
import { ensureDate } from "../../../Utils/DateTrannforms";
import { CalendarDayProps } from "../../../types/types";
import { EventItem } from "./EventItem";

const MAX_VISIBLE = 3;

const CalendarDayMemo: React.FC<CalendarDayProps> = ({
  day,
  events = [],
  onDayClick,
  onEventClick,
  onEventResize, // Passe se necessário
  config,
  onMouseDown, 
  onMouseMove,
  isSelected,
  monthDate, // Para outros meses
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const { setNodeRef, isOver } = useDroppable({
    id: day?.toISOString() || "empty",
    disabled: !day,
  });

  useEffect(() => {
    if (ref.current) setWidth(ref.current.offsetWidth);
  }, [day]);

  if (!day) {
    return <div className="react-agenfy-calendar-day-empty" />;
  }

  const dayEvents = events.filter((e) => {
    try {
      const eventStart = ensureDate(e.start, config?.timeZone);
      const eventEnd = addMilliseconds(ensureDate(e.end, config?.timeZone), 1); // ← Ajuste chave!
      return isWithinInterval(day, {
        start: startOfDay(eventStart),
        end: endOfDay(eventEnd), // Agora captura o dia completo
      }); 
    } catch (error) {
      console.error("Erro ao filtrar evento:", error, e);
      return false;
    }
  });

  const sorted = [...dayEvents].sort((a, b) => {
    const timeA = ensureDate(a.start, config?.timeZone).getTime();
    const timeB = ensureDate(b.start, config?.timeZone).getTime();
    if (timeA !== timeB) return timeA - timeB;

    const durA = ensureDate(a.end, config?.timeZone).getTime() - timeA;
    const durB = ensureDate(b.end, config?.timeZone).getTime() - timeB;
    return durB - durA;
  });

  const visible = sorted.slice(0, MAX_VISIBLE);
  const hidden = Math.max(0, sorted.length - MAX_VISIBLE);
  const isToday = isSameDay(day, new TZDate(new Date(), config?.timeZone)); 
  const isOtherMonth = monthDate && !isSameMonth(day, monthDate); // ← Adicione import isSameMonth

  const classes = [
    "react-agenfy-calendar-day",
    isToday && "react-agenfy-calendar-day-today",
    isOver && "react-agenfy-calendar-day-droppable-over",
    isSelected && "react-agenfy-calendar-day-selected",
    isOtherMonth && "react-agenfy-calendar-day-other-month",
  ].filter(Boolean).join(" ");

  return (
    <div
      ref={(el) => {
        ref.current = el;
        setNodeRef(el);
      }}
      className={classes}
      onClick={(e) => { e.stopPropagation(); onDayClick?.(day); }}
      onMouseDown={() => onMouseDown?.(day)}
      onMouseMove={() => onMouseMove?.(day)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onDayClick?.(day); } }}
      role="button"
      tabIndex={0}
      aria-label={format(day, "d MMMM yyyy")}
    >
      <div className="react-agenfy-calendar-day-header">
        <span className={`react-agenfy-day-number ${isToday ? "react-agenfy-day-number-today" : ""} ${isOtherMonth ? "react-agenfy-day-number-other-month" : ""}`}>
          {format(day, "d")}
        </span>
        {hidden > 0 && (
          <span
            className="react-agenfy-hidden-events"
            onClick={(e) => {
              e.stopPropagation();
              const list = sorted.slice(MAX_VISIBLE).map((ev) =>
                `${ev.title} (${format(ensureDate(ev.start, config?.timeZone), "HH:mm")} - ${format(ensureDate(ev.end, config?.timeZone), "HH:mm")})`
              ).join("\n");
              alert(`+${hidden} eventos:\n${list}`);
            }}
            role="button"
            aria-label={`+${hidden} eventos ocultos`}
          >
            +{hidden}
          </span>
        )}
      </div>
      <div className="react-agenfy-day-events">
        {visible.map((event) => {
          const s = ensureDate(event.start, config?.timeZone);
          const e = ensureDate(event.end, config?.timeZone);

          const isEventStart = isSameDay(s, day);
          const isEventEnd = isSameDay(e, day) || (e.getHours() === 0 && e.getMinutes() === 0 && e.getSeconds() === 0 && isSameDay(addMilliseconds(e, 1), day));

          return (
            <EventItem
              key={`${event.id}-${day.toISOString()}`}
              event={event} 
              isStart={isEventStart}
              isEnd={isEventEnd}
              isMultiDay={event.isMultiDay || !isSameDay(s, e)} // ← Calcula dinamicamente se necessário
              onEventClick={onEventClick}
              onEventResize={onEventResize}
              config={config}
              dayWidth={width}
              isOtherMonth={isOtherMonth}
            />
          );
        })}
      </div>
    </div>
  );
};

export const CalendarDay = memo(CalendarDayMemo);