import React, { useMemo, useState, FC, memo } from 'react';
import { NumberSize, ResizeDirection, Resizable } from "re-resizable";
import { useDraggable } from "@dnd-kit/core";
import { addDays, addHours, format, differenceInDays, isSameDay } from "date-fns";
import { TZDate } from "@date-fns/tz";
import { ensureDate } from "../../../Utils/DateTrannforms";
import ResourceDisplay from "../../../Components/Resource/ResourceDisplay";
import { BaseEventProps } from '../../../types';

const DEFAULT_MAX_WIDTH = 160;

const EventItemComponent: FC<BaseEventProps & { dayWidth: number }> = ({
  isStart,
  isEnd,
  event,
  isPreview = false,
  onEventClick,
  onEventResize,
  config,
  dayWidth,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    data: { event },
  });

  const [isResizing, setIsResizing] = useState(false);

  const style = !isResizing && transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
      }
    : {
      position: "relative",
    };

  const [dimensions, setDimensions] = useState({
    width: event.width || (event.isMultiDay ? "100%" : "100%"),
    height: event.height || 40,
  });

  const containerStyle = {
    backgroundColor: event.color || "#3490dc",
    zIndex: isDragging ? 1000 : "auto",
      width: dimensions.width,
    height: dimensions.height /2,
    ...style,
  };

  const baseClass = "react-agenfy-event-item";
  const draggingClass = isDragging ? "react-agenfy-event-item-dragging" : "";
  const previewClass = isPreview ? "react-agenfy-event-item-preview" : "";

  const multiDayStartClass = event.isMultiDay && isStart ? "react-agenfy-event-item-multiday-start" : "";
  const multiDayEndClass = event.isMultiDay && isEnd ? "react-agenfy-event-item-multiday-end" : "";
  const multiDayMiddleClass = event.isMultiDay && !isStart && !isEnd ? "react-agenfy-event-item-multiday-middle" : "";

  const combinedClass = [baseClass, draggingClass, previewClass, multiDayStartClass, multiDayEndClass, multiDayMiddleClass]
    .filter(Boolean)
    .join(" ");


  const handleResizeEvent = (
    e: MouseEvent | TouchEvent,
    direction: ResizeDirection,
    ref: HTMLDivElement,
    delta: NumberSize
  ) => {
    setIsResizing(false);
    const newWidth = ref.style.width;
    const newHeight = ref.style.height;

    setDimensions({
      width: newWidth,
      height: newHeight,
    });

    if (onEventResize && (direction === "right" || direction === "left")) {
      const effectiveDayWidth = dayWidth > 0 ? dayWidth : DEFAULT_MAX_WIDTH;
      let daysAdded = Math.round(delta.width / effectiveDayWidth);

      if (direction === "left") {
        daysAdded = -daysAdded;
      }

      const eventStart = ensureDate(event.start, config?.timeZone);
      const eventEnd = ensureDate(event.end, config?.timeZone);

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

      const tzNewStart = new TZDate(newStart, config?.timeZone);
      const tzNewEnd = new TZDate(newEnd, config?.timeZone);

      onEventResize({
        ...event,
        start: tzNewStart.toISOString(),
        end: tzNewEnd.toISOString(),
        isMultiDay: !isSameDay(tzNewStart, tzNewEnd),
      });
    }
  };

  const resizeHandles = useMemo(() => {
    if (event.isMultiDay) {
      const handles: ResizeDirection[] = [];
      if (isStart) {
        handles.push("left");
      }
      if (isEnd) {
        handles.push("right");
      }
      return handles;
    }
    return ["right"];
  }, [event.isMultiDay, isStart, isEnd]);

  return (
    <Resizable
      size={{ width: dimensions.width, height: dimensions.height }}
      onResizeStart={() => setIsResizing(true)}
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
          left: "0px",
          cursor: "w-resize",
        },
      }}
      enable={{
        right: resizeHandles.includes("right"),
        left: resizeHandles.includes("left"),
      }}
    >
      <div
        ref={setNodeRef}
        {...(!isResizing ? listeners : {})}
        {...(!isResizing ? attributes : {})}
        style={containerStyle}
        className={combinedClass}
        title={event.title}
        onClick={(e) => {
          e.stopPropagation();
          onEventClick?.(event);
        }}
      >
        {!(event.isMultiDay && !isStart) && (
          <>
            <div className="react-agenfy-event-item-content">
              <span>{event.title}</span>
              <span>{format(ensureDate(event.start, config?.timeZone), "HH:mm")}</span>
            </div>
            {event.resources && event.resources.length > 0 && (
              <div className="react-agenfy-event-item-resources">
                <ResourceDisplay resources={event.resources} maxVisible={2} />
              </div>
            )}
          </>
        )}
      </div>
    </Resizable>
  );
};

export const EventItem = memo(EventItemComponent);
