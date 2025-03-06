import { setHours, setMinutes, startOfDay } from "date-fns";

export function getSlotTime(baseDate: Date, slotMin: number, slotDuration: number, index: number) {
  const minutes = index * slotDuration;
  const hour = Math.floor(minutes / 60) + slotMin;
  const minute = minutes % 60;
  return setMinutes(setHours(startOfDay(baseDate), hour), minute).toISOString();
}
