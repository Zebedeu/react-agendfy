import React, { memo, useCallback, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { EventProps, TimeSlotProps as BaseTimeSlotProps, TimeSlotProps } from "../types/types";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { getSlotTime } from "../Utils/slotTime";



export const TimeSlotBase = memo(
  ({
    index,
    dayDate,
    slotEvents,
    onSlotClick,
    slotMin,
    config,
    children,
    containerClassName,
    labelRenderer,
    eventsContainerRenderer,
    dropId,
    isOver: propIsOver,
  }: TimeSlotProps & {
    children?: React.ReactNode;
    containerClassName?: string;
    labelRenderer?: () => React.ReactNode;
    eventsContainerRenderer?: (positionedEvents: EventProps) => React.ReactNode;
    dropId?: string | Date;
    isOver?: boolean;
  }) => {
    const slotTime = getSlotTime(dayDate, slotMin, config?.slotDuration!, index, config?.timeZone || 'UTC');
    const dropIdToUse = dropId || slotTime.toISOString();
    const { setNodeRef, isOver: hookIsOver } = useDroppable({ id: dropIdToUse.toString() });
    const isOver = propIsOver !== undefined ? propIsOver : hookIsOver;

    const handleClickSlot = useCallback(() => {
      if (typeof onSlotClick === "function") {
        onSlotClick(new TZDate(slotTime, config?.timeZone || 'UTC'));
      }
    }, [onSlotClick, slotTime, config?.timeZone]);

    return (
      <div
        ref={setNodeRef}
        onClick={handleClickSlot}
        className={`${containerClassName} ${isOver ? "react-agenfy-bg-green-200" : ""}`}
      >
        {labelRenderer && labelRenderer()}
        {eventsContainerRenderer && eventsContainerRenderer(slotEvents)}
        {children}
      </div>
    );
  }
);
