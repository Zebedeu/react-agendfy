import { setHours, setMinutes, startOfDay } from "date-fns";
import { TZDate } from "@date-fns/tz";

export function getSlotTime(
  baseDate: Date,
  slotMin: number,
  slotDuration: number,
  index: number,
  timeZone: string
): TZDate {
  const minutes = index * slotDuration;
  const hour = Math.floor(minutes / 60) + slotMin;
  const minute = minutes % 60;

  const dayStart = new TZDate(startOfDay(baseDate), timeZone);
  const newDate = setMinutes(setHours(dayStart, hour), minute);
  return new TZDate(newDate, timeZone);
}
