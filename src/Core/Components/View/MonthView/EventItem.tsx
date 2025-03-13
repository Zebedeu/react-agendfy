import React, { useMemo, useState } from "react";
import { NumberSize, ResizeDirection, Resizable } from "re-resizable";
import { BaseEventProps, Config, EventProps } from "../../../../types";
import ResourceDisplay from "../../Resource/ResourceDisplay";
import { useDraggable } from "@dnd-kit/core";
import { ensureDate } from "../../../../Utils/DateTrannforms";
import { addDays, addHours, format, differenceInDays } from "date-fns";
import { TZDate } from "@date-fns/tz";

const DEFAULT_MAX_WIDTH = 160;

export const EventItem: React.FC<BaseEventProps> = ({
  isStart,
  isEnd,
  event,
  isPreview = false,
  onEventClick,
  onEventResize,
  config,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    data: { event },
  });

  // Aplica transformações e opacidade quando o item estiver sendo arrastado
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        position: "relative",
        zIndex: isDragging ? 1000 : 1,
      }
    : {};

  const [dimensions, setDimensions] = useState({
    width: event.width || (event.isMultiDay ? "100%" : "100%"),
    height: event.height || 40,
  });

  const containerStyle = {
    backgroundColor: event.color || "#3490dc",
    width: dimensions.width,
    height: dimensions.height,
    ...style,
  };

  // Define as classes base, adicionando as classes condicionais
  const baseClass = "react-agenfy-event-item";
  const draggingClass = isDragging ? "react-agenfy-event-item-dragging" : "";
  const previewClass = isPreview ? "react-agenfy-event-item-preview" : "";
  const combinedClass = `${baseClass} ${draggingClass} ${previewClass}`;

  const handleResizeEvent = (
    e: MouseEvent | TouchEvent,
    direction: ResizeDirection,
    ref: HTMLDivElement,
    delta: NumberSize
  ) => {
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

      // Converte start e end para o fuso definido
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

      // Cria instâncias TZDate para preservar o fuso horário
      const tzNewStart = new TZDate(newStart, config?.timeZone);
      const tzNewEnd = new TZDate(newEnd, config?.timeZone);

      onEventResize({
        ...event,
        recurrence: "",
        start: tzNewStart.toISOString(),
        end: tzNewEnd.toISOString(),
        isMultiDay: true,
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
      enable={{
        right: resizeHandles.includes("right"),
        left: resizeHandles.includes("left"),
      }}
    >
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={containerStyle}
        className={combinedClass}
        title={event.title}
        onClick={(e) => {
          e.stopPropagation();
          onEventClick?.(event);
        }}
      >
        <div className="react-agenfy-event-item-content">
          <span>{event.title}</span>
          <span>{format(ensureDate(event.start, config?.timeZone), "HH:mm")}</span>
        </div>
        {event.resources && event.resources.length > 0 && (
          <div className="react-agenfy-event-item-resources">
            <ResourceDisplay resources={event.resources} maxVisible={2} />
          </div>
        )}
      </div>
    </Resizable>
  );
};
