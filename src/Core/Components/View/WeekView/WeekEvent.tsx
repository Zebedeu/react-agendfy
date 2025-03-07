import React from "react";
import { Resizable } from "re-resizable";
import BaseEvent from "../../BaseEvent";
import { addDays, addMinutes, differenceInMinutes, endOfDay, isAfter, setHours, startOfDay, subDays } from "date-fns";
import { useDraggable } from "@dnd-kit/core";
import { useEffect, useMemo, useState } from "react";
import { BaseEventProps } from "../../../../types";
import {  TZDate } from '@date-fns/tz';
import { ensureDate } from "../../../../Utils/DateTrannforms";

export const WeekEvent = ({
  event,
  onEventClick,
  positionStyle,
  onEventResize,
  config,
  isMultiDay,
  isStart,
  isEnd,
  dayDate,
  isDraggable,
  endHour,
}: BaseEventProps & { endHour: number }) => {
  const dayWidth = 100;

  // Calcula o horário máximo permitido para o evento
  const maxEndTime = useMemo(() => {
    const dayEndTime = setHours(startOfDay(dayDate), endHour);
    return isMultiDay ? endOfDay(dayDate) : dayEndTime;
  }, [dayDate, endHour, isMultiDay]);

  const [size, setSize] = useState({
    height: positionStyle?.height || "auto",
  });

  useEffect(() => {
    setSize({
      height: positionStyle?.height || "auto",
    });
  }, [positionStyle?.width, positionStyle?.height, isMultiDay]);

  const handleResize = (e, direction, ref, delta) => {
    if (!isDraggable || !onEventResize) return;

    const eventStart = ensureDate(event.start); // Timezone added here
    const eventEnd = ensureDate(event.end); // Timezone added here

    if (direction === "bottom") {
      const additionalMinutes = Math.round((delta.height / 40) * config?.slotDuration!);
      let newEndTime = addMinutes(eventEnd, additionalMinutes);

      if (isAfter(newEndTime, maxEndTime)) {
        const overflowMinutes = differenceInMinutes(newEndTime, maxEndTime);
        const nextDayStartTime = startOfDay(addDays(dayDate, 1));
        newEndTime = addMinutes(nextDayStartTime, overflowMinutes);
        onEventResize({ ...event, end: newEndTime, isMultiDay: true });
        return;
      }

      if (isAfter(newEndTime, eventStart)) {
        onEventResize({ ...event, end: newEndTime.toISOString() }); // toISOString added here
      }
    }

    if (direction === "right") {
      const daysAdded = Math.round(delta.width / dayWidth);
      if (daysAdded > 0) {
        const newEnd = addDays(eventEnd, daysAdded);
        onEventResize({ ...event, end: newEnd.toISOString() }); // toISOString added here
      }
    }

    if (direction === "left") {
      const daysRemoved = Math.round(delta.width / dayWidth);
      if (daysRemoved > 0) {
        const newStart = subDays(eventStart, daysRemoved);
        +    onEventResize({ ...event, start: newStart.toISOString() }); // toISOString added here
      }
    }

    setSize({
      height: ref.style.height,
    });
  };

  const enableResizing = isDraggable && onEventResize;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    data: { event },
    disabled: !isDraggable,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <Resizable
      size={size}
      enable={{ top: true, right: true, bottom: true, left: true }}
      onResizeStop={handleResize}
      className="absolute"
      style={{
        top: positionStyle?.top || "0",
        left: positionStyle?.left || "0",
        zIndex: 20,
        maxWidth: "100%",
        ...style,
      }}
      maxHeight={
        enableResizing
          ? `${(differenceInMinutes(maxEndTime, new TZDate(ensureDate(event.start))) / config?.slotDuration!) * 40}px` // Timezone added here
          : undefined
      }
    >
      <div ref={setNodeRef} {...listeners} {...attributes}>
        <BaseEvent
          event={event}
          onEventClick={onEventClick}
          positionStyle={{ width: "100%", height: "100%", top: "0", left: "0" }}
          config={config}
          isMultiDay={isMultiDay}
          isStart={isStart}
          isEnd={isEnd}
          dayDate={dayDate}
          isDraggable={isDraggable}
          customClassName="w-full h-full"
          parsedSlotMax={endHour}
        />
      </div>
    </Resizable>
  );
};