import React, { useCallback, useRef, useState } from "react";
import { DndContext, pointerWithin } from "@dnd-kit/core";
import {
  addDays,
  differenceInDays,
  format,
  isSameDay,
  isValid,
  parseISO,
} from "date-fns";
import { TZDate } from "@date-fns/tz";
import { EventProps } from "../types/types";
import { ensureDate } from "./DateTrannforms";
interface MonthViewDragAndDropInteractionProps {
  children: React.ReactNode;
  events: EventProps;
  onEventUpdate?: (event: EventProps) => void;
  onEventClick?: (event: EventProps) => void;
  config?: {
    timeZone?: string;
  };
}

const MonthViewDragAndDropInteraction: React.FC<MonthViewDragAndDropInteractionProps> = ({
  children,
  events,
  onEventUpdate,
  onEventClick,
  config,
}) => {
  const draggedEventRef = useRef<EventProps | null>(null);
  const timeZone = config?.timeZone;
  const [draggingEvent, setDraggingEvent] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [currentDropTarget, setCurrentDropTarget] = useState(null);

   const handleDragStart = (event: any) => {
     try {
       const { active } = event;
       if (!active || !active.data.current) return;
 
       const eventId = active.id;
       const dragData = active.data.current;
 
       if (dragData.event?.isRecurrenceInstance) {
         return;
       }
 
       const originalEvent = events.find((ev) => ev.id === eventId);
       if (!originalEvent) return;
 
       let offset = 0;
 
       if (dragData.isMultiDay) {
         const originalStart = ensureDate(originalEvent.start, config?.timeZone);
         const clickedDate = ensureDate(dragData.event.start, config?.timeZone);
 
         if (dragData.isStart) {
           offset = 0;
         } else if (dragData.isEnd) {
           offset = differenceInDays(ensureDate(originalEvent.end, config?.timeZone), originalStart);
         } else {
           offset = differenceInDays(clickedDate, originalStart);
         }
       }
 
       setDraggingEvent(eventId);
       setDragOffset(offset);
     } catch (error) {
       console.error("Erro no handleDragStart:", error);
       setDraggingEvent(null);
       setDragOffset(0);
     }
   };
 
   const handleDragOver = (event: any) => {
     const { over } = event;
     if (over && over.id && typeof over.id === "string" && over.id.match(/^\d{4}-\d{2}-\d{2}$/)) {
       setCurrentDropTarget(over.id);
     } else {
       setCurrentDropTarget(null);
     }
   };
 
   const handleDragEnd = (event: any) => {
     try {
       const { active, over, delta } = event;
       setDraggingEvent(null);
       setCurrentDropTarget(null);
 
       if (!active || !over) return;
 
       const eventId = active.id;
       const newDateStr = over.id;
 
       if (!newDateStr || !newDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return;
 
       const newDate = parseISO(newDateStr);
       if (!isValid(newDate)) return;
 
       const draggedEvent = events.find((ev) => ev.id === eventId);
       if (!draggedEvent) return;
 
       const originalStart = ensureDate(draggedEvent.start, config?.timeZone);
       const originalEnd = ensureDate(draggedEvent.end, config?.timeZone);
       const duration = differenceInDays(originalEnd, originalStart);
 
       const newStartDate = addDays(newDate, -dragOffset);
       const newStart = new TZDate(newStartDate, config?.timeZone);
       const newEndDate = addDays(newStart, duration);
       const newEnd = new TZDate(newEndDate, config?.timeZone);
 
       newStart.setHours(
         originalStart.getHours(),
         originalStart.getMinutes(),
         originalStart.getSeconds()
       );
       newEnd.setHours(
         originalEnd.getHours(),
         originalEnd.getMinutes(),
         originalEnd.getSeconds()
       );
 
       const updatedEvents = events.map((ev: EventProps) =>
         ev.id === eventId
           ? {
               ...ev,
               start: format(newStart, "yyyy-MM-dd HH:mm:ss"),
               end: format(newEnd, "yyyy-MM-dd HH:mm:ss"),
             }
           : ev
       );
 
       const updatedEvent = updatedEvents.find((ev) => ev.id === eventId);
 
       if (typeof onEventClick === "function") {
         if (Math.abs(delta.y) < 1) {
           onEventClick(updatedEvent);
           return;
         }
       }
 
       if (typeof onEventUpdate === "function") {
         onEventUpdate(updatedEvent);
       }
     } catch (error) {
       console.error("Erro no handleDragEnd:", error);
     }
   };
 
  return (
    <DndContext
    collisionDetection={pointerWithin}
    onDragStart={handleDragStart}
    onDragOver={handleDragOver}
    onDragEnd={handleDragEnd}
    >
      {children}
    </DndContext>
  );
};

export default MonthViewDragAndDropInteraction;