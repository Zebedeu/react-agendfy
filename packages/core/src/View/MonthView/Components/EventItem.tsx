import React, { useMemo, useState, FC, memo } from 'react';
import { NumberSize, ResizeDirection, Resizable } from "re-resizable";
import { useDraggable } from "@dnd-kit/core";
import { addDays, addHours, format, differenceInDays, isSameDay } from "date-fns";
import { TZDate } from "@date-fns/tz";
import { ensureDate } from "../../../Utils/DateTrannforms";
import ResourceDisplay from "../../../Components/Resource/ResourceDisplay";
import { BaseEventProps } from '../../../types/types';

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
  // Estado de resize
  const [isResizing, setIsResizing] = useState(false);

  // ✅ Define se o evento pode ser arrastado (apenas start e end se multi-day)
  const draggableEnabled = (event.isMultiDay && (isStart || isEnd)) || !event.isMultiDay;

  // Hook de drag do DnD Kit
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${event.id}-${isStart ? 'start' : isEnd ? 'end' : 'middle'}`,
    data: { event, isStart, isEnd },
    disabled: !draggableEnabled || isResizing,
  });

  const [dimensions, setDimensions] = useState({
    width: event.width || "100%",
    height: event.height || 40,
  });

  // 🔥 Transformação visual durante o drag
  const style = !isResizing && transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : { position: "relative" };

  const containerStyle = {
    backgroundColor: event.color || "#3490dc",
    zIndex: isDragging ? 1000 : "auto",
    width: dimensions.width,
    height: dimensions.height / 2,
    cursor: draggableEnabled ? "grab" : "default",
    opacity: isDragging ? 0.5 : 1,
    ...style,
  };

  const combinedClass = [
    "react-agenfy-event-item",
    isDragging && "react-agenfy-event-item-dragging",
    isPreview && "react-agenfy-event-item-preview",
    event.isMultiDay && isStart && "react-agenfy-event-item-multiday-start",
    event.isMultiDay && isEnd && "react-agenfy-event-item-multiday-end",
    event.isMultiDay && !isStart && !isEnd && "react-agenfy-event-item-multiday-middle",
  ]
    .filter(Boolean)
    .join(" ");

  /**
   * 📏 Handler de resize (início e fim)
   */
  const handleResizeEvent = (
    e: MouseEvent | TouchEvent,
    direction: ResizeDirection,
    ref: HTMLDivElement,
    delta: NumberSize
  ) => {
    setIsResizing(false);
    const effectiveDayWidth = dayWidth > 0 ? dayWidth : DEFAULT_MAX_WIDTH;

    let daysAdded = Math.round(delta.width / effectiveDayWidth);
    if (direction === "left") daysAdded = -daysAdded;

    const eventStart = ensureDate(event.start, config?.timeZone);
    const eventEnd = ensureDate(event.end, config?.timeZone);

    let newStart = eventStart;
    let newEnd = eventEnd;

    if (direction === "right") newEnd = addDays(eventEnd, daysAdded);
    else if (direction === "left") newStart = addDays(eventStart, daysAdded);

    // Garante coerência
    if (newStart >= newEnd) {
      if (direction === "right") newEnd = addHours(newStart, 1);
      else newStart = addHours(newEnd, -1);
    }

    onEventResize?.({
      ...event,
      start: new TZDate(newStart, config?.timeZone).toISOString(),
      end: new TZDate(newEnd, config?.timeZone).toISOString(),
      isMultiDay: !isSameDay(newStart, newEnd),
    });
  };

  /**
   * 🧭 Define handles de resize (somente extremidades)
   */
  const resizeHandles = useMemo(() => {
    if (event.isMultiDay) {
      const handles: ResizeDirection[] = [];
      if (isStart) handles.push("left");
      if (isEnd) handles.push("right");
      return handles;
    }
    return ["right"];
  }, [event.isMultiDay, isStart, isEnd]);

  /**
   * 🧩 Aplicação de drag completo no bloco
   */
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onEventClick?.(event);
      }}
    >
      <Resizable
        size={{ width: dimensions.width, height: dimensions.height }}
        onResizeStart={() => setIsResizing(true)}
        onResizeStop={handleResizeEvent}
        minWidth={50}
        maxHeight={50}
        handleStyles={{
          right: { width: "8px", right: "0px", cursor: "e-resize" },
          left: { width: "8px", left: "0px", cursor: "w-resize" },
        }}
        enable={{
          right: resizeHandles.includes("right"),
          left: resizeHandles.includes("left"),
        }}
      >
        <div
          ref={setNodeRef}
          {...(!isResizing && draggableEnabled ? listeners : {})}
          {...(!isResizing && draggableEnabled ? attributes : {})}
          style={containerStyle}
          className={combinedClass}
          title={event.title}
        >
          {/* Só mostra conteúdo no início do evento (ou evento único) */}
          {(isStart || !event.isMultiDay) && (
            <>
              <div className="react-agenfy-event-item-content">
                <span>{event.title}</span>
                <span>{format(ensureDate(event.start, config?.timeZone), "HH:mm")}</span>
              </div>
              {event.resources?.length > 0 && (
                <div className="react-agenfy-event-item-resources">
                  <ResourceDisplay resources={event.resources} maxVisible={2} />
                </div>
              )}
            </>
          )}
        </div>
      </Resizable>
    </div>
  );
};

export const EventItem = memo(EventItemComponent);
