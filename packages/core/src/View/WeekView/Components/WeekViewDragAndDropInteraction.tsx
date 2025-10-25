import { TZDate } from "@date-fns/tz";
import { rrulestr } from "rrule";

import React, { useCallback, useRef, useState } from "react";
import { DndContext, pointerWithin } from "@dnd-kit/core";
import { addDays, addMinutes, differenceInDays, differenceInMinutes, format, isValid, parseISO } from "date-fns";
import { EventProps, WeekProps } from "../../../types";
import { ensureDate } from "../../../Utils/DateTrannforms";


export const DndContextComponent = ({
  events,
  onEventUpdate,
  onEventClick,
  config,
  slotDuration = 30,
  handleDragEnd,
  children,
}: Omit<WeekProps, "events"> & {
  events: EventProps;
  slotDuration?: number;
  children: React.ReactNode;
}) => {
  const draggedEventRef = useRef<EventProps | null>(null);

  const handleDragStart = useCallback((event: any) => {
    const { active } = event;

    if (active?.id) {
      draggedEventRef.current = events.find((e: EventProps) => e.id === active.id) || null;
    }
  }, [events]);

  const handleDragEnd2 = useCallback((event: any) => {
    const { active, over, delta } = event;
    draggedEventRef.current = null;

    if (!active?.id || !over?.id) return;

    const baseTime = new TZDate(new Date(over.id), config?.timeZone);
    if (!isValid(baseTime)) return;

    const additionalMinutes = active.transform ? (active.transform.y / 40) * slotDuration : 0;
    const newStartTime = addMinutes(baseTime, additionalMinutes);

    const draggedEvent = events.find((ev: EventProps) => ev.id === active.id);
    if (!draggedEvent) return;

    const duration = differenceInMinutes(
      ensureDate(draggedEvent.end, config?.timeZone),
      ensureDate(draggedEvent.start, config?.timeZone)
    );
    const updatedEvent = {
      ...draggedEvent,
      start: newStartTime.toISOString(),
      end: addMinutes(newStartTime, duration).toISOString(),
    };

   
  }, [events, config?.timeZone, slotDuration, onEventClick, onEventUpdate]);

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd2}
    >
      {children}
    </DndContext>
  );
};


export default DndContextComponent;
