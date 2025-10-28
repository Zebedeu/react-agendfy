import React, { useCallback } from "react";
import { DndContext } from "@dnd-kit/core";
import {
  addMinutes,
  differenceInMinutes,
  isValid,
  startOfDay,
  format,
  setHours,
  setMinutes,
  isSameDay,
} from "date-fns";
import { ensureDate } from "../../Utils/DateTrannforms";
import { DayViewProps, EventProps } from "../../types/types";
import { TZDate } from "@date-fns/tz";
import { TimeSlot } from "./Components/TimeSlot";
import { calculateRedLineOffset } from "../../Utils/calculateRedLineOffset";
import { getEventsForSlot } from "../../Utils/weekViewHelpers";

const DayView: React.FC<DayViewProps> = ({
  events,
  onEventUpdate,
  onEventClick,
  onSlotClick,
  currentDate,
  config,
}: DayViewProps) => {
  const parseTime = (timeStr: string | undefined) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes / 60);
  };
  const parsedSlotMin = parseTime(config?.slotMin);
  const parsedSlotMax = parseTime(config?.slotMax);
  const numberOfSlots =
    Math.floor(((parsedSlotMax - parsedSlotMin) * 60) / (config?.slotDuration || 30));

  if (isNaN(numberOfSlots) || numberOfSlots <= 0) {
    return (
      <div>
        {config?.slotDuration} invalid time slot. Make sure the end time is greater than the start time and that they are valid hours.
      </div>
    );
  }

  const handleDragEnd = useCallback(
    (event: any) => {
      const { active, over, delta } = event;
      if (!active?.id || !over?.id) return;

      const baseTime = new TZDate(over.id, config?.timeZone || 'UTC');
      if (!isValid(baseTime)) return;

      const draggedEvent = events.find((ev: EventProps) => ev.id === active.id);
      if (!draggedEvent) return;

      const duration = differenceInMinutes(
        ensureDate(draggedEvent.end, config?.timeZone),
        ensureDate(draggedEvent.start, config?.timeZone)
      );

      const updatedEvent = {
        ...draggedEvent,
        start: baseTime.toISOString(),
        end: addMinutes(baseTime, duration).toISOString(),
      };

      if (Math.abs(delta.y) < 1 && onEventClick) {
        onEventClick(updatedEvent);
        return;
      }

      if (onEventUpdate) {
        onEventUpdate(updatedEvent);
      }
    },
    [events, config?.timeZone, onEventClick, onEventUpdate]
  );

  const getSlotEvents = useCallback(
    (slotTime: string) => getEventsForSlot(slotTime, events, config),
    [events, config]
  );

  const today = new TZDate(new Date(), config?.timeZone || 'UTC');
  const isToday = isSameDay(currentDate, today);
  const redLineOffset = calculateRedLineOffset(
    currentDate,
    parsedSlotMin,
    config?.slotDuration || 30,
    config?.timeZone
  );

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div 
        className="react-agenfy-dayview-container"
        style={{ position: 'relative', zIndex: 0 }}
      >
        {[...Array(numberOfSlots)].map((_, index) => {
          const minutes = index * (config?.slotDuration || 30);
          const totalMinutes = (parsedSlotMin * 60) + minutes;
          const calculatedHour = Math.floor(totalMinutes / 60);
          const minute = minutes % 60;
          const slotTime = setMinutes(
            setHours(startOfDay(currentDate), calculatedHour),
            minute
          ).toISOString();
          const slotEvents = getSlotEvents(slotTime);
          return (
            <TimeSlot
              key={index}
              index={index}
              slotEvents={slotEvents}
              onEventUpdate={onEventUpdate}
              onSlotClick={onSlotClick}
              dayDate={currentDate}
              slotMin={parsedSlotMin}
              parsedSlotMax={parsedSlotMax}
              config={config}
            />
          );
        })}
        {isToday && (
          <div
            style={{
              position: "absolute",
              top: `${redLineOffset}px`,
              left: 0,
              right: 0,
              borderTop: "2px dashed red",
              zIndex: 15,
            }}
          />
        )}
      </div>
    </DndContext>
  );
};

export default DayView;
