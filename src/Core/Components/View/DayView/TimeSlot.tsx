import { useDroppable } from "@dnd-kit/core";
import { EventProps, TimeSlotProps } from "../../../../types";
import { getSlotTime } from "../../../../Utils/slotTime";
import { useCallback, useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { ensureDate } from "../../../../Utils/DateTrannforms";
import { EventItem } from "./EventItem";
import { TZDate } from "@date-fns/tz";

export const TimeSlot: React.FC<TimeSlotProps> = ({
  index,
  slotEvents,
  onEventUpdate,
  onSlotClick,
  dayDate,
  slotMin,
  parsedSlotMax,
  config,
}: TimeSlotProps) => {
  const slotTime = getSlotTime(dayDate, slotMin, config?.slotDuration!, index, config?.timeZone!);

  const { setNodeRef } = useDroppable({ id: slotTime });

  const handleClickSlot = useCallback(() => {
    if (onSlotClick) {
      onSlotClick(new TZDate(slotTime, config?.timeZone));
    }
  }, [onSlotClick, slotTime, config?.timeZone]);

  const positionedEvents = useMemo(() => {
    if (!slotEvents || slotEvents.length === 0) return [];

    const eventsByStartTime = slotEvents.reduce((acc: { [key: string]: EventProps[] }, event: EventProps) => {
      const startTime = format(ensureDate(event.start, config?.timeZone), "yyyy-MM-dd HH:mm");
      acc[startTime] = acc[startTime] || [];
      acc[startTime].push(event);
      return acc;
    }, {});

    let positioned: EventProps[] = [];
    Object.values(eventsByStartTime).forEach((eventGroup) => {
      if (eventGroup.length > 0) {
        const eventWidthPercentage = 100 / eventGroup.length;
        eventGroup.forEach((event, idx) => {
          positioned.push({
            ...event,
            positionStyle: {
              left: `${idx * eventWidthPercentage}%`,
              width: `${eventWidthPercentage}%`,
              top: "0",
              marginLeft: "60px",
            },
          });
        });
      }
    });
    return positioned;
  }, [slotEvents, config?.timeZone]);

  return (
    <div ref={setNodeRef} className="react-agenfy-timeslot-container" onClick={handleClickSlot}>
      <span className="react-agenfy-timeslot-label">
        {format(new TZDate(slotTime, config?.timeZone), "HH:mm")}
      </span>
      <div className="react-agenfy-timeslot-events">
        {positionedEvents.map((event: EventProps) => {
          const eventStart = ensureDate(event.start, config?.timeZone);
          const eventEnd = ensureDate(event.end, config?.timeZone);
          const isMultiDayEvent = !isSameDay(eventStart, eventEnd);
          const isEventStart = isSameDay(eventStart, dayDate);
          const isEventEnd = isSameDay(eventEnd, dayDate);
          return (
            <EventItem
              key={event.id}
              event={event}
              positionStyle={event.positionStyle}
              onEventUpdate={onEventUpdate}
              isMultiDay={isMultiDayEvent}
              isStart={isEventStart}
              isEnd={isEventEnd}
              config={config}
              dayDate={dayDate}
              parsedSlotMax={parsedSlotMax}
            />
          );
        })}
      </div>
    </div>
  );
};
