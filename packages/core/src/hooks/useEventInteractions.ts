import { useCallback, useRef } from "react";
import { addMinutes, differenceInMinutes, isValid } from "date-fns";
import { TZDate } from "@date-fns/tz";
import { EventProps } from "../types";
import { ensureDate } from "../Utils/DateTrannforms";

export const useEventInteractions = ({ 
  events, 
  onEventUpdate, 
  onEventClick, 
  slotDuration, 
  timeZone 
}) => {
  // useRef to store the dragged event
  const draggedEventRef = useRef(null);

  // Handlers for drag and drop events
  const handleDragStart = useCallback((event) => {
    const { active } = event;
    if (active?.id) {
      draggedEventRef.current = events.find((e) => e.id === active.id) || null;
    }
  }, [events]);

  const handleDragEnd = useCallback((event) => {
    const { active, over, delta } = event;
    draggedEventRef.current = null;
    if (!active?.id || !over?.id) return;

    const baseTime = new TZDate(new Date(over.id), timeZone);
    if (!isValid(baseTime)) return;

    const additionalMinutes = active.transform ? (active.transform.y / 40) * slotDuration : 0;
    const newStartTime = addMinutes(baseTime, additionalMinutes);

    const draggedEvent = events.find((ev) => ev.id === active.id);
    if (!draggedEvent) return;

    const duration = differenceInMinutes(
      ensureDate(draggedEvent.end, timeZone),
      ensureDate(draggedEvent.start, timeZone)
    );
    const updatedEvent = {
      ...draggedEvent,
      start: newStartTime.toISOString(),
      end: addMinutes(newStartTime, duration).toISOString(),
    };

    // If the movement is minimal, treat it as a click
    if (Math.abs(delta.y) < 1) {
      onEventClick?.(updatedEvent);
      return;
    }
    
    // Otherwise, update the event position
    if (typeof onEventUpdate === "function") {
      onEventUpdate(updatedEvent);
    }
  }, [events, timeZone, slotDuration, onEventClick, onEventUpdate]);

  // Determine if events are draggable
  const isDraggable = useCallback(() => typeof onEventUpdate === "function", [onEventUpdate]);

  return {
    handleDragStart,
    handleDragEnd,
    isDraggable: isDraggable()
  };
};