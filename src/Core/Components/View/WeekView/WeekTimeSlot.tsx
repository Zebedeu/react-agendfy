import React from "react";
import { differenceInMinutes } from "date-fns";
import { EventProps, TimeSlotProps } from "../../../../types";
import { WeekEvent } from "./WeekEvent";
import { ensureDate } from "../../../../Utils/DateTrannforms";
import { memo, useCallback, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { getSlotTime } from "../../../../Utils/slotTime";
import { TZDate } from '@date-fns/tz';
// --- Componente WeekTimeSlot ---
export const WeekTimeSlot = memo(
  ({
    index,
    dayDate,
    slotEvents,
    onEventClick,
    onSlotClick,
    onEventResize,
    parsedSlotMax, // será repassado como endHour
    slotMin,
    config,
    isDraggable,
  }: TimeSlotProps) => {
    const slotTime = getSlotTime(dayDate, slotMin, config?.slotDuration!, index, config?.timeZone);
    const { setNodeRef, isOver } = useDroppable({ id: slotTime });

    const handleClickSlot = useCallback(() => {
      if (typeof onSlotClick === "function") {
        onSlotClick(slotTime); // Use TZDate for slot click
      }
    }, [onSlotClick, slotTime]);

    // Mapeamento simples para eventos do slot (na grade de horários)
    const positionedEvents: EventProps[] = useMemo(() => {
      if (!slotEvents || slotEvents.length === 0) return [];
      return slotEvents.map((event: EventProps, i: number, arr: EventProps[]) => {
        const total = Math.max(arr.length, 1);
        return {
          ...event,
          positionStyle: {
            top: "0",
            left: `${(i * 100) / total}%`,
            width: `${100 / total}%`,
            height: `${
              (differenceInMinutes(ensureDate(event.end, config?.timeZone), ensureDate(event.start, config?.timeZone)) /
                config?.slotDuration!) *
              40
            }px`,
          },
        };
      });
    }, [slotEvents, config?.slotDuration, config?.timeZone]);

    const backgroundColor = isOver ? "bg-green-200" : "";

    return (
      <div
        ref={setNodeRef}
        onClick={handleClickSlot}
        className={`relative border-b border-gray-200 h-10 transition-colors duration-200 ${backgroundColor}`}
      >
        {positionedEvents.map((event: EventProps) => (
          <WeekEvent
            key={event.id}
            event={event}
            config={config}
            dayDate={dayDate}
            onEventClick={onEventClick}
            onEventResize={onEventResize}
            positionStyle={event.positionStyle}
            endHour={parsedSlotMax}
            isDraggable={isDraggable}
          />
        ))}
      </div>
    );
  }
);