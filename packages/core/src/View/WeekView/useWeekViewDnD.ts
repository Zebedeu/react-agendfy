import { useCallback, useState, useRef } from 'react';
import { addMinutes, differenceInMinutes, isValid } from 'date-fns';
import { TZDate } from '@date-fns/tz';
import { ensureDate } from '../../Utils/DateTrannforms';
import { EventProps, WeekProps } from '../../types';

interface UseWeekViewDnDProps {
  events: EventProps[];
  config: WeekProps['config'];
  slotDuration: number;
  onEventUpdate?: (event: EventProps) => void;
  onEventClick?: (event: EventProps) => void;
}

export const useWeekViewDnD = ({
  events,
  config,
  slotDuration,
  onEventUpdate,
  onEventClick,
}: UseWeekViewDnDProps) => {
  const [activeEvent, setActiveEvent] = useState<EventProps | null>(null);
  const draggedEventRef = useRef<EventProps | null>(null);

  const handleDragStart = useCallback((event: any) => {
    const { active } = event;
    if (active?.id) {
      const foundEvent = events.find((e) => e.id === active.id) || null;
      setActiveEvent(foundEvent);
      draggedEventRef.current = foundEvent;
    }
  }, [events]);

  const handleDragEnd = useCallback((event: any) => {
    const { active, over, delta } = event;
    setActiveEvent(null);
    draggedEventRef.current = null;

    if (!active?.id || !over?.id) return;

    const baseTime = new TZDate(over.id, config?.timeZone || 'UTC');
    if (!isValid(baseTime)) return;

    const draggedEvent = events.find((ev) => ev.id === active.id);
    if (!draggedEvent) return;

    const duration = differenceInMinutes(ensureDate(draggedEvent.end, config?.timeZone), ensureDate(draggedEvent.start, config?.timeZone));
    const updatedEvent = { ...draggedEvent, start: baseTime.toISOString(), end: addMinutes(baseTime, duration).toISOString() };

    if (Math.abs(delta.y) < 1) onEventClick?.(updatedEvent);
    else onEventUpdate?.(updatedEvent);
  }, [events, config?.timeZone, slotDuration, onEventClick, onEventUpdate]);

  return { activeEvent, handleDragStart, handleDragEnd };
};