import React, { memo, useCallback, useMemo } from 'react';
import { EventProps, TimeSlotProps } from "../../../types";
import { WeekEvent } from "./WeekEvent";
import { useDroppable } from "@dnd-kit/core";
import { getSlotTime } from "../../../Utils/slotTime";
import { computePositionedEvents } from "../../../Utils/positionedEventsHelper";
import { renderEventComponent } from "./renderEventComponent";

export interface WeekTimeSlotProps extends TimeSlotProps {
  eventRenderingPlugins?: any[];
  onSelectionMouseDown?: (date: Date) => void;
  onSelectionMouseMove?: (date: Date) => void;
  isSelected?: boolean;
}

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
    eventRenderingPlugins,
    onSelectionMouseDown,
    onSelectionMouseMove,
    isSelected,
  }: WeekTimeSlotProps) => {
    const slotTime = getSlotTime(dayDate, slotMin, config?.slotDuration!, index, config?.timeZone);
    const { setNodeRef, isOver } = useDroppable({ id: slotTime.toISOString() });

    const handleClickSlot = useCallback(() => {
      if (typeof onSlotClick === "function") {
        onSlotClick(slotTime);
      }
    }, [onSlotClick, slotTime]);

    const positionedEvents: EventProps[] = useMemo(() => {
      return computePositionedEvents(slotEvents, config);
    }, [slotEvents, config]);

    const slotClasses = [
      "react-agenfy-weektimeslot",
      isOver && "react-agenfy-bg-green-200",
      isSelected && "react-agenfy-weektimeslot-selected",
    ].filter(Boolean).join(" ");

    return (
      <div
        ref={setNodeRef}
        onMouseDown={() => onSelectionMouseDown?.(slotTime)}
        onMouseMove={() => onSelectionMouseMove?.(slotTime)}
      onClick={handleClickSlot}
        className={slotClasses}
      >
        {positionedEvents.map((event: EventProps) => {
          const pluginElement = renderEventComponent(
            event,
            config,
            dayDate,
            onEventClick,
            onEventResize,
            parsedSlotMax,
            isDraggable,
            eventRenderingPlugins
          );
          return pluginElement ? (
            React.cloneElement(pluginElement, { key: event.id })
          ) : (
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
          );
        })}
      </div>
    );
  }
);
