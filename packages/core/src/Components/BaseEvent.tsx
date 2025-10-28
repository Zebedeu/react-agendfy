import React from "react";
import { format, parseISO, differenceInMinutes, startOfDay, endOfDay } from "date-fns";
import { useDraggable } from "@dnd-kit/core";
import generateTooltipContent from "../Utils/generateTooltipContent";
import ResourceDisplay from "./Resource/ResourceDisplay";
import { BaseEventProps } from "../types/types";
import { TZDate } from "@date-fns/tz";

const BaseEvent = ({
  event,
  onEventClick,
  positionStyle = {},
  isPreview = false,
  isMultiDay = false,
  isStart = false,
  isEnd = false,
  config,
  dayDate,
  isDraggable = true,
  customClassName = "",
}: BaseEventProps) => {
  const dragId = isMultiDay ? event.originalEventId || event.id : event.id;
  const draggableProps = isDraggable
    ? useDraggable({
        id: dragId,
        data: {
          event,
          isMultiDay,
          isStart,
          isMiddle: isMultiDay && !isStart && !isEnd,
          isEnd,
        },
      })
    : { attributes: {}, listeners: {}, setNodeRef: () => {}, transform: null, isDragging: false };

  const { attributes, listeners, setNodeRef, transform, isDragging } = draggableProps;

  let computedTop = positionStyle.top || "0";
  let computedHeight = positionStyle.height;

  if (computedHeight === undefined || computedHeight === null) {
    if (isMultiDay && dayDate) {
      const dayStart = startOfDay(new TZDate(dayDate, config?.timeZone));
      const dayEnd = endOfDay(new TZDate(dayDate, config?.timeZone));
      const actualStart = new TZDate(parseISO(event.start.toString()), config?.timeZone);
      const actualEnd = new TZDate(parseISO(event.end.toString()), config?.timeZone);
      const effectiveStart = isStart ? actualStart : dayStart;
      const effectiveEnd = isEnd ? actualEnd : dayEnd;
      computedHeight =
        (differenceInMinutes(effectiveEnd, effectiveStart) / config?.slotDuration!) * 40;
      computedTop =
        isStart
          ? `${(differenceInMinutes(actualStart, dayStart) / config?.slotDuration!) * 40}px`
          : "0";
    } else {
      computedHeight =
        (differenceInMinutes(
          new TZDate(parseISO(event.end.toString()), config?.timeZone),
          new TZDate(parseISO(event.start.toString()), config?.timeZone)
        ) / config?.slotDuration!) * 40;
    }

    if (typeof computedHeight === "number") {
      computedHeight = `${computedHeight}px`;
    }
  }

  const eventStyle = {
    ...positionStyle,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    top: computedTop,
    height: computedHeight,
    opacity: isDragging ? 0.8 : 1,
    boxShadow: isDragging ? "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" : "none",
    backgroundColor: event.color,
  };

  const displayTitle = event.title + "\b";
  const tooltipContent = generateTooltipContent(event, isMultiDay, isStart, isEnd);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={eventStyle}
      className={`react-agenfy-baseevent ${isPreview ? "react-agenfy-baseevent--preview" : ""} ${customClassName}`}
      title={tooltipContent}
      onClick={(e) => {
        if (!isDragging && onEventClick) onEventClick(event);
        e.stopPropagation();
      }}
    >
      <div 
        className="react-agenfy-baseevent__time"
        style={{ color: 'var(--color-text-white)' }}
      >
        {displayTitle}{" "}
        {format(new TZDate(parseISO(event.start.toString()), config?.timeZone), "HH:mm")} -{" "}
        {format(new TZDate(parseISO(event.end.toString()), config?.timeZone), "HH:mm")}
      </div>
      <ResourceDisplay resources={event.resources} maxVisible={2} />
    </div>
  );
};

export default BaseEvent;
