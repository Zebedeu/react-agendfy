import { differenceInMinutes, format } from "date-fns";
import { EventProps } from "../types";
import { ensureDate } from "../Utils/DateTrannforms";

export function computePositionedEvents(
  slotEvents: EventProps[],
  config: any,
  groupByStart: boolean = false,
  extraStyle: object = {}
): EventProps[] {
  if (!slotEvents || slotEvents.length === 0) return [];

  if (groupByStart) {
    const eventsByStart = slotEvents.reduce((acc: { [key: string]: EventProps[] }, event: EventProps) => {
      const key = format(ensureDate(event.start, config?.timeZone), "yyyy-MM-dd HH:mm");
      acc[key] = acc[key] || [];
      acc[key].push(event);
      return acc;
    }, {});

    let positioned: EventProps[] = [];
    Object.values(eventsByStart).forEach((group) => {
      const total = group.length;
      group.forEach((event, idx) => {
        positioned.push({
          ...event,
          positionStyle: {
            left: `${(idx * 100) / total}%`,
            width: `${100 / total}%`,
            top: "0",
            ...extraStyle,
          },
        });
      });
    });
    return positioned;
  } else {
    const total = Math.max(slotEvents.length, 1);
    return slotEvents.map((event, idx) => ({
      ...event,
      positionStyle: {
        top: "0",
        left: `${(idx * 100) / total}%`,
        width: `${100 / total}%`,
        height: `${
          (differenceInMinutes(ensureDate(event.end), ensureDate(event.start)) / config?.slotDuration) * 40
        }px`,
      },
    }));
  }
}
