import React from "react";
import { differenceInMinutes } from "date-fns";
import { EventProps, TimeSlotProps } from "../../../../types";
import { WeekEvent } from "./WeekEvent";
import { ensureDate } from "../../../../Utils/DateTrannforms";
import { memo, useCallback, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { getSlotTime } from "../../../../Utils/slotTime";

export const WeekTimeSlot = memo(
  ({
    index,
    dayDate,
    slotEvents,
    onEventClick,
    onSlotClick,
    onEventResize,
    parsedSlotMax,
    slotMin,
    config,
    isDraggable,
  }: TimeSlotProps) => {
    const slotTime = getSlotTime(dayDate, slotMin, config?.slotDuration!, index, config?.timeZone);

    const { setNodeRef, isOver } = useDroppable({ id: slotTime.toISOString() });

    const handleClickSlot = useCallback(() => {
      if (typeof onSlotClick === "function") {
        onSlotClick(slotTime);
      }
    }, [onSlotClick, slotTime]);

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
              (differenceInMinutes(ensureDate(event.end), ensureDate(event.start)) /
                config?.slotDuration!) *
              40
            }px`,
          },
        };
      });
    }, [slotEvents, config?.slotDuration, config?.timeZone]);

    const backgroundColor = isOver ? "react-agenfy-bg-green-200" : "";

    return (
      <div
        ref={setNodeRef}
        onClick={handleClickSlot}
        className={`react-agenfy-weektimeslot ${backgroundColor}`}
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
