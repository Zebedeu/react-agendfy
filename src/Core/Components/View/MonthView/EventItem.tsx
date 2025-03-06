import React from "react";
import { Resizable } from "re-resizable";
import { BaseEventProps, Config, EventProps } from "../../../../types";
import ResourceDisplay from "../../Resource/ResourceDisplay";
import { useDraggable } from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { ensureDate } from "../../../../Utils/DateTrannforms";
import { addDays, addHours, format } from "date-fns";

const DEFAULT_MAX_WIDTH =160;

export const EventItem = ({ isStart, isEnd, event, isPreview = false, onEventClick, onEventResize, config }: BaseEventProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: event.id,
      data: { event },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.7 : 1,
        position: "relative",
        zIndex: isDragging ? 1000 : 1,
      }
    : {};

  const [dimensions, setDimensions] = useState({
    width: event.width || (event.isMultiDay ? "100%" : 200),
    height: event.height || 40,
  });

  const containerStyle = {
    backgroundColor: event.color || "#3490dc",
    width: dimensions.width,
    height: dimensions.height,
    ...style,
  };

  const className = `
    text-xs font-semibold
    rounded px-1.5 py-0.5
    text-white truncate
    ${isDragging ? "shadow-lg" : "shadow"}
    ${isPreview ? "opacity-50" : ""}
    cursor-pointer
  `;

  const handleResizeEvent = (e, direction, ref, delta) => {
    const newWidth = ref.style.width;
    const newHeight = ref.style.height;
    
    setDimensions({
      width: newWidth,
      height: newHeight,
    });

    if (onEventResize && (direction === "right" || direction === "left")) {
      const dayWidth = DEFAULT_MAX_WIDTH; // Largura aproximada de um dia no calendário
      let daysAdded = Math.round(delta.width / dayWidth);
      
      if (direction === "left") {
        daysAdded = -daysAdded;
      }
      
      const eventStart = ensureDate(event.start, config?.timeZone!);
      const eventEnd = ensureDate(event.end, config?.timeZone!);
      
      let newStart = eventStart;
      let newEnd = eventEnd;
      
      if (direction === "right") {
        newEnd = addDays(eventEnd, daysAdded);
      } else if (direction === "left") {
        newStart = addDays(eventStart, daysAdded);
      }

      newStart.setHours(
        eventStart.getHours(),
        eventStart.getMinutes(),
        eventStart.getSeconds()
      );
      
      newEnd.setHours(
        eventEnd.getHours(),
        eventEnd.getMinutes(),
        eventEnd.getSeconds()
      );
      
      if (newStart >= newEnd) {
        if (direction === "right") {
          newEnd = addHours(newStart, 1);
        } else {
          newStart = addHours(newEnd, -1);
        }
      }
      
      const formattedStart = format(newStart, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
      const formattedEnd = format(newEnd, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
      
      onEventResize({
        ...event,
        recurrence: '',
        start: formattedStart,
        end: formattedEnd,
        isMultiDay: true

      });
    }
  };

  const resizeHandles = useMemo(() => {
    if (event.isMultiDay) {
      if (isStart && isEnd) return ["right", "left"];
      if (isStart) return ["right"];
      if (isEnd) return ["left"];
      return [];
    }
    return ["right"];
  }, [event.isMultiDay, isStart, isEnd]);

  return (
    <Resizable
      size={{ height: dimensions.height }}
      onResizeStop={handleResizeEvent}
      minWidth={50}
      maxHeight={50}
      handleStyles={{
        right: {
          width: "8px",
          right: "0px",
          cursor: "e-resize",
        },
        left: {
          width: "8px",
          left: "8px",
          cursor: "w-resize",
        },
      }}
    >
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={containerStyle}
        className={className}
        title={event.title}
        onClick={(e) => {
          e.stopPropagation();
          onEventClick?.(event);
        }}
      >
        <div className="flex items-center justify-between">
        <span>{event.title}</span>
        <span>{format(event.start, 'HH:mm')}</span>
        </div>
        {event.resources && event.resources.length > 0 && (
          <div className="mt-1">
            <ResourceDisplay resources={event.resources} />
          </div>
        )}
      </div>
    </Resizable>
  );
};