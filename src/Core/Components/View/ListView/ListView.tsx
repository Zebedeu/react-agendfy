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
import { TZDate } from "@date-fns/tz"; // Import TZDate
import { ListEvent } from "./ListEvent";
import { EventProps } from "../../../../types";


const ListView = ({ events, onEventClick, currentDate = new Date(), locale, config }) => { // Add config prop
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
      <div className="p-8 flex flex-col items-center justify-center">
        <p className="text-center text-gray-500 text-lg">
        There are no events for this period.
        </p>
      {/*   <p className="text-center text-gray-400 mt-2">
          Em breve, poderá aparecer um SVG aqui!
        </p> */}
      </div>
    );
  }

  return (
    <div className="w-full">
      {daysWithEvents.map((day) => {
        const dayKey = format(day, "yyyy-MM-dd", { locale });
        const dayEvents = eventsByDay[dayKey] || [];
        return (
          <div key={dayKey} className="border-b border-gray-200 p-4">
            <div className="mb-3">
              <h2 className="text-xl font-semibold text-gray-800">
                {format(new TZDate(day, config?.timeZone), "EEEE, dd MMMM", { locale })} {/* Use TZDate and timezone */}
              </h2>
            </div>
            <div className="space-y-2">
              {dayEvents.map((event: EventProps) => (
                <ListEvent
                  key={event.id}
                  event={event}
                  onEventClick={onEventClick}
                  currentDate={day}
                  config={config} // Pass config to ListEvent
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