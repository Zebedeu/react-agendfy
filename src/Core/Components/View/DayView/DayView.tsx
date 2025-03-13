
import React, { useCallback, useMemo } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  format,
  addMinutes,
  differenceInMinutes,
  isValid,
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  isSameDay,
} from "date-fns";
import { rrulestr } from "rrule";
import { ensureDate } from "../../../../Utils/DateTrannforms";
import { DayViewProps, EventProps } from "../../../../types";
import { TZDate } from "@date-fns/tz";
import { TimeSlot } from "./TimeSlot";
import { calculateRedLineOffset } from "../../../../Utils/calculateRedLineOffset";

const DayView: React.FC<DayViewProps> = ({
  events,
  onEventUpdate,
  onEventClick,
  onSlotClick,
  currentDate,
  slotMin = "0",
  slotMax = "24",
  config,
}: DayViewProps) => {
  const parsedSlotMin = parseInt(slotMin, 10);
  const parsedSlotMax = parseInt(slotMax, 10);
  const numberOfSlots =
    ((parsedSlotMax - parsedSlotMin) * 60) / (config?.slotDuration || 30);

  if (isNaN(numberOfSlots) || numberOfSlots <= 0) {
    return (
      <div>
        {config?.slotDuration} de tempo inválido. Certifique-se de que a hora final seja maior que a hora inicial e que sejam horas válidas.
      </div>
    );
  }

  const getSlotEvents = useCallback(
    (slotTime: string) => {
      const slotDate = new TZDate(slotTime, config?.timeZone);
      return events.reduce((slotEvents: EventProps[], event) => {
        const eventStart = ensureDate(event.start, config?.timeZone);
        const eventEnd = ensureDate(event.end, config?.timeZone);

        if (event.recurrence) {
          try {
            const rule = rrulestr(event.recurrence);
            const dates = rule.between(startOfDay(currentDate), endOfDay(currentDate), true);
            dates.forEach((occurrence) => {
              const occurrenceStart = setMinutes(
                setHours(new TZDate(occurrence, config?.timeZone), eventStart.getHours()),
                eventStart.getMinutes()
              );
              const occurrenceEnd = addMinutes(
                occurrenceStart,
                differenceInMinutes(eventEnd, eventStart)
              );
              if (
                format(occurrenceStart, "yyyy-MM-dd HH:mm") ===
                format(slotDate, "yyyy-MM-dd HH:mm")
              ) {
                slotEvents.push({
                  ...event,
                  start: occurrenceStart.toISOString(),
                  end: occurrenceEnd.toISOString(),
                  recurring: true,
                });
              }
            });
          } catch (error) {
            console.error("Error parsing recurrence rule:", error);
          }
        } else if (event.isMultiDay) {
          if (currentDate >= startOfDay(eventStart) && currentDate <= endOfDay(eventEnd)) {
            const effectiveStart = isSameDay(currentDate, eventStart)
              ? eventStart
              : startOfDay(currentDate);
            const effectiveEnd = isSameDay(currentDate, eventEnd)
              ? eventEnd
              : endOfDay(currentDate);
            if (
              format(effectiveStart, "yyyy-MM-dd HH:mm") ===
              format(slotDate, "yyyy-MM-dd HH:mm")
            ) {
              slotEvents.push({
                ...event,
                start: effectiveStart.toISOString(),
                end: effectiveEnd.toISOString(),
              });
            }
          }
        } else {
          if (
            format(eventStart, "yyyy-MM-dd HH:mm") ===
            format(slotDate, "yyyy-MM-dd HH:mm")
          ) {
            slotEvents.push(event);
          }
        }
        return slotEvents;
      }, []);
    },
    [currentDate, events, config?.slotDuration, config?.timeZone]
  );

  const today = new TZDate(new Date(), config?.timeZone);
  const isToday = isSameDay(currentDate, today);
  const redLineOffset = calculateRedLineOffset(
    currentDate,
    parsedSlotMin,
    config?.slotDuration || 30,
    config?.timeZone
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event;
    if (!over) return;
    const updatedEvents = events.map((ev) => {
      if (ev.id === active.id) {
        const newStart = new TZDate(over.id, config?.timeZone);
        if (!isValid(newStart)) return ev;
        const duration = differenceInMinutes(
          ensureDate(ev.end, config?.timeZone),
          ensureDate(ev.start, config?.timeZone)
        );
        return {
          ...ev,
          start: newStart.toISOString(),
          end: addMinutes(newStart, duration).toISOString(),
        };
      }
      return ev;
    });

    const updatedEvent = updatedEvents.find((ev) => ev.id === active.id) as EventProps;

    if (Math.abs(delta.y) < 1) {
      onEventClick?.(updatedEvent);
      return;
    }

    if (typeof onEventUpdate === "function") {
      onEventUpdate(updatedEvent);
    }
  }, [events, onEventUpdate, onEventClick, config?.timeZone]);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="react-agenfy-dayview-container">
        {[...Array(numberOfSlots)].map((_, index) => {
          const minutes = index * (config?.slotDuration || 30);
          const hour = Math.floor(minutes / 60);
          const calculatedHour = hour + parsedSlotMin;
          const minute = minutes % 60;
          const slotTime = setMinutes(
            setHours(startOfDay(currentDate), calculatedHour),
            minute
          ).toISOString();
          const slotEvents = getSlotEvents(slotTime);
          return (
            <TimeSlot
              key={index}
              index={index}
              slotEvents={slotEvents}
              onEventUpdate={onEventUpdate}
              onSlotClick={onSlotClick}
              dayDate={currentDate}
              slotMin={parsedSlotMin}
              parsedSlotMax={parsedSlotMax}
              config={config}
            />
          );
        })}
        {isToday && (
          <div
            style={{
              position: "absolute",
              top: `${redLineOffset}px`,
              left: 0,
              right: 0,
              borderTop: "2px dashed red",
              zIndex: 15,
            }}
          />
        )}
      </div>
    </DndContext>
  );
};

export default DayView;
