// MonthView.tsx
import React, { useMemo, useCallback, useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { endOfWeek, isSameMonth, format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, addDays, getDay, isSameDay } from 'date-fns';
import { TZDate } from '@date-fns/tz';
import { ensureDate, expandRecurringEvents } from '../../Utils/DateTrannforms';
import { getLocale } from '../../Utils/locate';
import ResourceView from '../../Components/Resource/ResourceView';
import { MonthViewProps, EventProps } from '../../types/types';
import { EventItem } from './Components/EventItem';
import { CalendarDay } from './Components/CalendarDay';
import { normalizeEvents } from '../../Utils/calendarHelpers';

const MonthView: React.FC<MonthViewProps> = ({
  events = [],
  resources = [],
  currentDate = new Date(),
  onEventUpdate,
  onDayClick,
  onEventClick,
  onDateRangeSelect,
  config,
  showResourceView = false,
  onEventResize
}) => {
  const [activeEvent, setActiveEvent] = useState<EventProps | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [selStart, setSelStart] = useState<Date | null>(null);
  const [selEnd, setSelEnd] = useState<Date | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
const monthStart = useMemo(() => startOfMonth(new TZDate(currentDate, config?.timeZone)), [currentDate, config?.timeZone]);
  const tz = config?.timeZone;
  const locale = getLocale(config?.lang);

  const { weeks, expandedEvents } = useMemo(() => {
  const viewStart = startOfWeek(monthStart);
  const monthEnd = endOfMonth(monthStart);
  const viewEnd = endOfWeek(monthEnd);

  // Normalização e expansão de eventos para cobrir toda a view (inclui spans para prev/next)
  const normalized = normalizeEvents(events); // Sua função existente
  const expanded = expandRecurringEvents(normalized, viewStart, viewEnd, config?.timeZone || 'UTC');

  // Gera todas as datas reais da view (sem nulls)
  const allDays = eachDayOfInterval({ start: viewStart, end: viewEnd });
  const weeks: Date[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  return { weeks, expandedEvents: expanded };
}, [events, resources, currentDate, config?.timeZone, normalizeEvents]);

  const handleDragStart = (e: any) => setActiveEvent(e.active.data.current.event);
  const handleDragEnd = (e: any) => {
    setActiveEvent(null);
    const { active, over } = e;
    if (!over || !onEventUpdate) return;

    const event = active.data.current.event as EventProps;
    const targetDate = new Date(over.id);
    const origStart = ensureDate(event.start, tz);

    if (isSameDay(targetDate, origStart)) return;

    const hours = origStart.getHours(), mins = origStart.getMinutes();
    targetDate.setHours(hours, mins);

    const duration = ensureDate(event.end, tz).getTime() - origStart.getTime();
    const newEnd = new Date(targetDate.getTime() + duration);

    onEventUpdate({
      ...event,
      start: targetDate.toISOString(),
      end: newEnd.toISOString(),
    });
  };

  const handleMouseDown = (d: Date) => { setSelecting(true); setSelStart(d); setSelEnd(d); };
  const handleMouseMove = (d: Date) => { if (selecting) setSelEnd(d); };
  const handleMouseUp = () => {
    if (selecting && selStart && selEnd && onDateRangeSelect) {
      const [start, end] = selStart < selEnd ? [selStart, selEnd] : [selEnd, selStart];
      onDateRangeSelect({ start: start.toISOString(), end: end.toISOString(), isMultiDay: !isSameDay(start, end) });
    }
    setSelecting(false); setSelStart(null); setSelEnd(null);
  };

  const isSelected = (d: Date) => selecting && selStart && selEnd && d >= (selStart < selEnd ? selStart : selEnd) && d <= (selStart > selEnd ? selStart : selEnd);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {showResourceView && resources.length > 0 && (
        <ResourceView resources={resources} events={expandedEvents} currentDate={currentDate} />
      )}

      <div className="react-agenfy-monthview-container" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <div className="react-agenfy-monthview-header">
          {eachDayOfInterval({
            start: startOfWeek(new TZDate(currentDate, tz)),
            end: addDays(startOfWeek(new TZDate(currentDate, tz)), 6),
          }).map(d => (
            <div key={d.toISOString()} className="react-agenfy-monthview-day-label">
              {format(d, 'EEEEEE', { locale })}
            </div>
          ))}
        </div>

        <div className="react-agenfy-monthview-grid-container">
          {weeks.map((week, i) => (
            <div key={i} className="react-agenfy-monthview-week-row">
              {week.map((day, j) => (
                <CalendarDay
                  key={day ? format(day, 'yyyy-MM-dd') : `empty-${i}-${j}`}
                  day={day}
                  events={expandedEvents}
                  onDayClick={onDayClick}
                  onEventClick={onEventClick}
                  config={config}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  isSelected={isSelected(day)}
                  monthDate={monthStart}
                  onEventResize={onEventResize}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeEvent && <EventItem event={activeEvent} isPreview isStart isEnd={false} config={config} dayWidth={150} />}
      </DragOverlay>
    </DndContext>
  );
};

export default MonthView;