// EventItem.tsx
import React, { memo, useMemo, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { format, differenceInDays, addDays, addHours, isSameDay } from 'date-fns';
import { Resizable } from "re-resizable"; // Adicione de volta
import { TZDate } from '@date-fns/tz';
import { ensureDate } from '../../../Utils/DateTrannforms';
import ResourceDisplay from '../../../Components/Resource/ResourceDisplay';
import { BaseEventProps } from '../../../types/types';
import './EventItem.css';

interface EventItemProps extends BaseEventProps {
  dayWidth: number;
  isPreview?: boolean;
  isStart: boolean;
  isEnd: boolean;
  config?: any;
}

const EventItemMemo: React.FC<EventItemProps & { dayWidth: number; isOtherMonth?: boolean }> = ({
  event,
  isStart,
  isEnd,
  isPreview = false,
  onEventClick,
  config,
  dayWidth,
  onEventResize,
  isOtherMonth = false,
}) => {
  const draggableId = `${event.id}-${isStart ? 'start' : isEnd ? 'end' : 'single'}`;
  const canDrag = event.isMultiDay ? (isStart || isEnd) : true;

  const [isResizing, setIsResizing] = useState(false);
  const [dimensions, setDimensions] = useState({ width: "100%", height: 40 });

  const draggableEnabled = !event.isMultiDay || (isStart || isEnd);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${event.id}-${isStart ? 'start' : isEnd ? 'end' : 'middle'}`,
    data: { event, isStart, isEnd },
    disabled: !draggableEnabled || isResizing,
  });
  const startTime = useMemo(() => {
    const date = ensureDate(event.start, config?.timeZone);
    return format(date, 'HH:mm');
  }, [event.start, config?.timeZone]);

  const showContent = isStart || !event.isMultiDay;
 
  const className = [
    'react-agenfy-event-item',
    isDragging && 'react-agenfy-event-item-dragging',
    isPreview && 'react-agenfy-event-item-preview',
    event.isMultiDay && isStart && 'react-agenfy-event-item-multiday-start',
    event.isMultiDay && isEnd && 'react-agenfy-event-item-multiday-end',
    event.isMultiDay && !isStart && !isEnd && 'react-agenfy-event-item-multiday-middle',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={setNodeRef}
      className={className}
      style={{
        backgroundColor: event.color || '#3490dc',
        cursor: canDrag ? 'grab' : 'pointer',
        opacity: isDragging ? 0.7 : 1,
        width: event.width || '100%',
        height: 20 ,
        zIndex: isDragging ? 1000 : 'auto',
      }}
      title={event.title}
      onClick={(e) => {
        e.stopPropagation();
        onEventClick?.(event);
      }}
      {...(canDrag ? listeners : {})}
      {...(canDrag ? attributes : {})}
    >
      {showContent && (
        <>
          <div className="react-agenfy-event-item-content">
            <span>{event.title}</span>
            <span>{startTime}</span>
          </div>
          {event.resources?.length > 0 && (
            <div className="react-agenfy-event-item-resources">
              <ResourceDisplay resources={event.resources} maxVisible={2} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const EventItem = memo(EventItemMemo);