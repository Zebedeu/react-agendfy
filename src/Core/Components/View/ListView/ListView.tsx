import React, { useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  addDays,
  isWithinInterval,
  parseISO,
  startOfDay,
  endOfDay,
} from "date-fns";
import { TZDate } from "@date-fns/tz";
import { ListEvent } from "./ListEvent";
import { EventProps, ListViewProps } from "../../../../types";
import { getLocale } from "../../../../Utils/locate";
import './../../../../css/ListView.css';

const ListView = ({
  events,
  onEventClick,
  currentDate = new Date(),
  config,
}: ListViewProps) => {
  // Define o intervalo do mês atual
  const monthStart = startOfMonth(new TZDate(currentDate, config?.timeZone));
  const monthEnd = endOfMonth(new TZDate(currentDate, config?.timeZone));

  // Gera um array com todos os dias do mês
  const days = useMemo(() => {
    const dayList = [];
    let day = monthStart;
    while (day <= monthEnd) {
      dayList.push(day);
      day = addDays(day, 1);
    }
    return dayList;
  }, [monthStart, monthEnd]);

  // Agrupa os eventos por dia (chave: "yyyy-MM-dd")
  const eventsByDay = useMemo(() => {
    const grouped = {};
    days.forEach((day) => {
      const dayKey = format(day, "yyyy-MM-dd");
      grouped[dayKey] = [];
    });
    events.forEach((event: EventProps) => {
      const eventStart = new TZDate(parseISO(event.start.toString()), config?.timeZone);
      const eventEnd = new TZDate(parseISO(event.end.toString()), config?.timeZone);
      days.forEach((day) => {
        if (
          isWithinInterval(day, {
            start: startOfDay(new TZDate(eventStart, config?.timeZone)),
            end: startOfDay(new TZDate(eventEnd, config?.timeZone)),
          })
        ) {
          const dayKey = format(day, "yyyy-MM-dd");
          grouped[dayKey] = grouped[dayKey] || [];
          grouped[dayKey].push(event);
        }
      });
    });
    return grouped;
  }, [days, events, config?.timeZone]);

  // Filtra apenas os dias que possuem eventos
  const daysWithEvents = useMemo(() => {
    return days.filter((day) => {
      const dayKey = format(day, "yyyy-MM-dd");
      return eventsByDay[dayKey] && eventsByDay[dayKey].length > 0;
    });
  }, [days, eventsByDay]);

  if (daysWithEvents.length === 0) {
    return (
      <div className="react-agenfy-listview-empty">
        <p className="react-agenfy-listview-empty-text">
          There are no events for this period.
        </p>
      </div>
    );
  }

  return (
    <div className="react-agenfy-listview-container">
      {daysWithEvents.map((day) => {
        const dayKey = format(day, "yyyy-MM-dd", { locale: getLocale(config?.timeZone ) });
        const dayEvents = eventsByDay[dayKey] || [];
        return (
          <div key={dayKey} className="react-agenfy-listview-day-container">
            <div className="react-agenfy-listview-day-header-wrapper">
              <h2 className="react-agenfy-listview-day-header">
                {format(new TZDate(day, config?.timeZone), "EEEE, dd MMMM", { locale:  getLocale(config?.timeZone ) })}
              </h2>
            </div>
            <div className="react-agenfy-listview-day-events">
              {dayEvents.map((event: EventProps) => (
                <ListEvent
                  key={event.id}
                  event={event}
                  onEventClick={onEventClick}
                  currentDate={day}
                  config={config}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ListView;
