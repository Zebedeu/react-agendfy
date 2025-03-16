import React, { memo, useCallback, useMemo } from "react";
import { EventProps, TimeSlotProps } from "../../../types";
import { WeekEvent } from "./WeekEvent";
import { useDroppable } from "@dnd-kit/core";
import { getSlotTime } from "../../../Utils/slotTime";
import { computePositionedEvents } from "../../../Utils/positionedEventsHelper";
import { renderEventComponent } from "./renderEventComponent";

export interface WeekTimeSlotProps extends TimeSlotProps {
  eventRenderingPlugins?: any[]; // pass plugin(s) separately
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
    eventRenderingPlugins
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

    const backgroundColor = isOver ? "react-agenfy-bg-green-200" : "";

    return (
      <div
        ref={setNodeRef}
        onClick={handleClickSlot}
        className={`react-agenfy-weektimeslot ${backgroundColor}`}
      >
        {positionedEvents.map((event: EventProps) => {
          // Always render the plugin component first
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
          // Use pluginElement if it returns a valid element; otherwise, fall back to WeekEvent.
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
