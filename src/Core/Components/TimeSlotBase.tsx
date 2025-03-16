import React, { memo, useCallback, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { EventProps, TimeSlotProps as BaseTimeSlotProps } from "../../../../types";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { getSlotTime } from "../../Utils/slotTime";
import { Config } from "../../types";

interface CommonTimeSlotProps extends BaseTimeSlotProps {
  dayDate: Date;
  slotMin: string;
  config?: Config;
}

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
  }: CommonTimeSlotProps & {
    children?: React.ReactNode;
    containerClassName?: string;
    labelRenderer?: () => React.ReactNode;
    eventsContainerRenderer?: (positionedEvents: EventProps) => React.ReactNode;
    dropId?: string | Date;
    isOver?: boolean;
  }) => {
    const slotTime = getSlotTime(dayDate, slotMin, config?.slotDuration!, index, config?.timeZone);
    const dropIdToUse = dropId || slotTime.toISOString();
    const { setNodeRef, isOver: hookIsOver } = useDroppable({ id: dropIdToUse.toString() });
    const isOver = propIsOver !== undefined ? propIsOver : hookIsOver;

    const handleClickSlot = useCallback(() => {
      if (typeof onSlotClick === "function") {
        onSlotClick(new TZDate(slotTime, config?.timeZone));
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

export type TimeSlotProps = CommonTimeSlotProps; // Exporta para manter a compatibilidade