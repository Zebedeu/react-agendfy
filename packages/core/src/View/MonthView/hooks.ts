import { useState, useMemo, useCallback, useRef } from 'react';
import {
  addDays,
  addMinutes,
  differenceInMinutes,
  endOfDay,
  format,
  isSameDay,
  isValid,
  setHours,
  setMinutes,
  startOfDay,
  startOfWeek,
} from 'date-fns';
import { TZDate } from '@date-fns/tz';
import { ensureDate } from '../../Utils/DateTrannforms';
import { getEventsForSlot } from '../../Utils/weekViewHelpers';
import { calculateRedLineOffset } from '../../Utils/calculateRedLineOffset';
import { EventProps, WeekProps } from '../../types/types';

const parseTime = (timeStr: string | undefined) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
};

export const useWeekView = (
  currentDate: Date,
  config: WeekProps['config'],
  events: EventProps[],
  isMobile: boolean,
  slotMin: string,
  slotMax: string
) => {
  const startHour = useMemo(() => parseTime(slotMin), [slotMin]);
  const endHour = useMemo(() => parseTime(slotMax), [slotMax]);
  const slotDuration = config?.slotDuration || 30;

  const numberOfSlots = useMemo(
    () => Math.floor(((endHour - startHour) * 60) / slotDuration),
    [startHour, endHour, slotDuration]
  );

  const currentWeekStart = useMemo(
    () => startOfWeek(new TZDate(currentDate, config?.timeZone || 'UTC'), { weekStartsOn: 0 }),
    [currentDate, config?.timeZone]
  );

  const daysOfWeek = useMemo(
    () => (isMobile ? [currentDate.getDay()] : Array.from({ length: 7 }, (_, i) => i)),
    [isMobile, currentDate]
  );

  const timeSlots = useMemo(() => Array.from({ length: numberOfSlots }, (_, i) => i), [numberOfSlots]);

  const timeslotLabels = useMemo(() => {
    return timeSlots.map((index) => {
      const time = setMinutes(
        setHours(
          startOfDay(new TZDate(currentDate, config?.timeZone || 'UTC')),
          Math.floor(startHour) + Math.floor((index * slotDuration + (startHour % 1) * 60) / 60)
        ),
        (index * slotDuration) % 60
      );
      return format(time, 'HH:mm');
    });
  }, [timeSlots, currentDate, config?.timeZone, startHour, slotDuration]);

  const redLineOffset = useMemo(
    () => calculateRedLineOffset(currentDate, startHour, slotDuration, config?.timeZone || 'UTC'),
    [currentDate, startHour, slotDuration, config?.timeZone]
  );

  const { allDayEventsByDay, timeGridEvents } = useMemo(() => {
    const mapping: { [key: number]: EventProps[] } = {};
    const gridEvents: EventProps[] = [];

    events.forEach((event) => {
      if (event.isAllDay || event.isMultiDay) {
        daysOfWeek.forEach((dayIndex) => {
          const dayDate = addDays(currentWeekStart, dayIndex);
          const eventStart = ensureDate(event.start, config?.timeZone || 'UTC');
          const eventEnd = ensureDate(event.end, config?.timeZone || 'UTC');
          if (dayDate >= startOfDay(eventStart) && dayDate <= endOfDay(eventEnd)) {
            if (!mapping[dayIndex]) mapping[dayIndex] = [];
            mapping[dayIndex].push(event);
          }
        });
      } else {
        gridEvents.push(event);
      }
    });
    return { allDayEventsByDay: mapping, timeGridEvents: gridEvents };
  }, [daysOfWeek, currentWeekStart, events, config?.timeZone]);

  const memoizedGetEventsForSlot = useCallback(
    (slotTime: string) => getEventsForSlot(slotTime, timeGridEvents, config),
    [timeGridEvents, config]
  );

  return {
    startHour,
    endHour,
    slotDuration,
    numberOfSlots,
    currentWeekStart,
    daysOfWeek,
    timeSlots,
    timeslotLabels,
    redLineOffset,
    allDayEventsByDay,
    timeGridEvents,
    getEventsForSlot: memoizedGetEventsForSlot,
  };
};

export const useWeekViewSelection = (
  slotDuration: number,
  onDateRangeSelect?: (range: { start: string; end: string; isMultiDay: boolean }) => void
) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);

  const handleSelectionMouseDown = useCallback((slotTime: Date) => {
    if (!slotTime) return;
    setIsSelecting(true);
    setSelectionStart(slotTime);
    setSelectionEnd(slotTime);
  }, []);

  const handleSelectionMouseMove = useCallback(
    (slotTime: Date) => {
      if (isSelecting && slotTime) {
        setSelectionEnd(slotTime);
      }
    },
    [isSelecting]
  );

  const handleSelectionMouseUp = useCallback(() => {
    if (isSelecting && selectionStart && selectionEnd && onDateRangeSelect) {
      const start = selectionStart < selectionEnd ? selectionStart : selectionEnd;
      const end = selectionStart > selectionEnd ? selectionStart : selectionEnd;
      const finalEnd = addMinutes(end, slotDuration);

      onDateRangeSelect({
        start: start.toISOString(),
        end: finalEnd.toISOString(),
        isMultiDay: !isSameDay(start, end),
      });
    }
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  }, [isSelecting, selectionStart, selectionEnd, onDateRangeSelect, slotDuration]);

  const isSlotSelected = useCallback(
    (slotTime: Date) => {
      if (!isSelecting || !selectionStart || !selectionEnd || !slotTime) return false;
      const start = selectionStart < selectionEnd ? selectionStart : selectionEnd;
      const end = selectionStart > selectionEnd ? selectionStart : selectionEnd;
      return slotTime >= start && slotTime <= end;
    },
    [isSelecting, selectionStart, selectionEnd]
  );

  return {
    handleSelectionMouseDown,
    handleSelectionMouseMove,
    handleSelectionMouseUp,
    isSlotSelected,
  };
};