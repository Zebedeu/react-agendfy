import React, { useCallback, useState, useMemo } from "react";
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
import { ensureDate, expandRecurringEvents } from "../../Utils/DateTrannforms";
import ResourceView from "../../Components/Resource/ResourceView";
import { EventProps, MonthViewProps } from "../../types";
import { CalendarDay } from "./Components/CalendarDay";
import { TZDate } from "@date-fns/tz";
import { getLocale } from "../../Utils/locate";

const MonthView = ({
  events = [],
  resources = [],
  currentDate = new Date(),
  onEventResize,
  onDayClick,
  onEventClick,
  config,
  showResourceView = false,
}: MonthViewProps) => {
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
    </div>
  );
};

export default MonthView;
