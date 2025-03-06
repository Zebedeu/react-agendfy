
import React, { memo, useMemo } from "react";
import { differenceInMinutes, format, isSameDay, setHours, setMinutes, startOfDay } from "date-fns";
import { WeekTimeSlot } from "./WeekTimeSlot";
import { useBusinessHours } from "../../../../Utils/businessHours";
import { DayColumnProps, EventProps } from "../../../../types";
import { TZDate } from '@date-fns/tz';

export const DayColumn = memo(
  ({
    dayDate,
    events,
    timeSlots,
    parsedSlotMin, // startHour
    onEventClick,
    onSlotClick,
    getEvents,
    parsedSlotMax, // endHour
    onEventResize,
    redLineOffset,
    config,
    isDraggable,
  }: DayColumnProps) => {

    const isToday = isSameDay(dayDate, new TZDate(new Date(), config?.timeZone));
    const dayStart = startOfDay(dayDate);


    // Calcula os intervalos de expediente para o dia, se estiver ativado na configuração

    // Mapeia os eventos para os slots (excluindo os all-day/multi-day, que serão renderizados na área all-day)
    const eventsMapping = useMemo(() => {
      const mapping: Record<string, EventProps[]> = {};
      timeSlots.forEach((index) => {
        const slotDate = setMinutes(
          setHours(dayStart, parsedSlotMin + Math.floor((index * config?.slotDuration!) / 60)),
          (index * config?.slotDuration!) % 60
        );
        const slotKey = slotDate.toISOString();
        let slotEvents = getEvents(slotKey) || [];
        mapping[slotKey] = slotEvents;
      });
      return mapping;
    }, [dayStart, parsedSlotMin, timeSlots, getEvents, config?.slotDuration]);

    const businessIntervals = useBusinessHours(dayDate, config?.businessHours);

    return (
      <div className={`flex-1 min-w-0 relative ${isToday ? "bg-blue-50" : ""}`}>
        <div
          className={`h-12 border-b border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 ${
            isToday ? "bg-blue-100" : ""
          }`}
          onClick={() => {
            if (typeof onSlotClick === "function") onSlotClick(new TZDate(dayDate, config?.timeZone)); // Use TZDate for day click
          }}
        >
          <div className="text-center">
            <div className="text-sm font-medium">{format(dayDate, "EEE" as any)}</div>
            <div className="text-xs text-gray-500">{format(dayDate, "dd/MM" as any)}</div>
          </div>
        </div>
        <div className="relative" style={{ minHeight: timeSlots.length * 40, position: "relative" }}>
          {/* Renderiza overlay dos horários de expediente */}
          {businessIntervals.map((interval, idx) => {
            // Calcula a posição vertical (top) e a altura em pixels
            const top = (differenceInMinutes(interval.start, dayStart) / config?.slotDuration!) * 40;
            const height = (differenceInMinutes(interval.end, interval.start) / config?.slotDuration!) * 40;
            return (
              <div
                key={idx}
                style={{
                  position: "absolute",
                  top: `${top}px`,
                  height: `${height}px`,
                  left: 0,
                  right: 0,
                  backgroundColor: "rgba(0, 128, 0, 0.1)",
                  pointerEvents: "none", // para não interferir na interação
                  zIndex: 0,
                }}  
              />
            );
          })}

          {/* Renderiza os timeslots e os eventos */}
          {timeSlots.map((index) => {
            const slotTime = setMinutes(
              setHours(dayStart, parsedSlotMin + Math.floor((index * config?.slotDuration!) / 60)),
              (index * config?.slotDuration!) % 60
            ).toISOString();
            return (
              <WeekTimeSlot
                key={`${format(dayDate, "yyyy-MM-dd")}-${index}`}
                index={index}
                dayDate={dayDate}
                slotEvents={eventsMapping[slotTime]}
                onEventClick={onEventClick}
                onSlotClick={onSlotClick}
                slotMin={parsedSlotMin}
                config={config}
                parsedSlotMax={parsedSlotMax}
                onEventResize={onEventResize}
                isDraggable={isDraggable}
              />
            );
          })}
          <div
            style={{
              position: "absolute",
              top: `${redLineOffset}px`,
              left: 0,
              right: 0,
              borderTop: "2px dashed red",
              zIndex: 1,
            }}
          />
        </div>
      </div>
    );
  }
);
