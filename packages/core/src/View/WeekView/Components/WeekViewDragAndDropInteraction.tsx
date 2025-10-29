import { TZDate } from "@date-fns/tz";
import { rrulestr } from "rrule";

import React, { useCallback, useRef, useState } from "react";
import { DndContext, pointerWithin } from "@dnd-kit/core";
import { addDays, addMinutes, differenceInDays, differenceInMinutes, format, isValid, parseISO } from "date-fns";
import { ensureDate } from "../../../Utils/DateTrannforms";
import { EventProps, WeekProps } from "../../../types/types";

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


  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
    </DndContext>
  );
};

export default DndContextComponent;