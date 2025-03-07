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

  // Obtém o início do dia no fuso horário desejado
  const dayStart = new TZDate(startOfDay(baseDate), timeZone);
  // Ajusta as horas e os minutos
  const newDate = setMinutes(setHours(dayStart, hour), minute);
  // Retorna uma nova instância TZDate com o fuso horário
  return new TZDate(newDate, timeZone);
}
