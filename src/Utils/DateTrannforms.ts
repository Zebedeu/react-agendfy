import { TZDate } from "@date-fns/tz";
import { addMinutes, parseISO } from "date-fns";
import { RRule } from "rrule";
import { EventProps } from "../types";


/**
 * Expands recurring events within a given date range based on their recurrence rules.
 *
 * @param {EventProps[]} events - An array of event objects, some of which may have recurrence rules.
 * @param {string | Date} startDate - The start date of the range to expand events within (ISO string or Date object).
 * @param {string | Date} endDate - The end date of the range to expand events within (ISO string or Date object).
 * @param {string} timezone - The timezone to use for date calculations.
 * @returns {EventProps[]} - An array of expanded event objects, including instances of recurring events within the given range.
 */
export const expandRecurringEvents = (
  events: EventProps[],
  startDate: string | Date,
  endDate: string | Date,
  timezone: string
) => {
  // Converte startDate e endDate para TZDate para consistência de fuso horário
  const start = new TZDate(startDate, timezone);
  const end = new TZDate(endDate, timezone);

  let expandedEvents: EventProps[] = [];

  for (const event of events) {
    // Se o evento não tem regra de recorrência, adiciona-o diretamente
    if (!event.recurrence) {
      expandedEvents.push(event);
      continue;
    }

    try {
      // Parse da string rrule
      const rule = RRule.fromString(event.recurrence);

      // Obtém as ocorrências dentro do intervalo (inclusivo)
      const occurrences = rule.between(start, end, true);

      if (occurrences.length === 0) continue; // Se não há ocorrências, pula para o próximo evento

      const originalStart = parseISO(event.start as string);
      const originalEnd = parseISO(event.end as string);
      const durationInMinutes = (originalEnd.getTime() - originalStart.getTime()) / 60000;

      for (const date of occurrences) {
        // Cria uma nova data de início para a ocorrência, preservando o horário original

        // Primeiro, cria um TZDate a partir da data da ocorrência
        const newStart = new TZDate(date, timezone);
        // Converte para Date nativo para usar setUTCHours
        const nativeNewStart = new Date(newStart.getTime());
        nativeNewStart.setUTCHours(
          originalStart.getUTCHours(),
          originalStart.getUTCMinutes(),
          originalStart.getUTCSeconds(),
          originalStart.getUTCMilliseconds()
        );
        const finalNewStart = new TZDate(nativeNewStart, timezone);

        // Calcula o novo horário de término adicionando a duração em minutos
        const newEnd = addMinutes(finalNewStart, durationInMinutes);
        // Ajusta o horário de término para que coincida com o original em UTC
        const nativeNewEnd = new Date(newEnd.getTime());
        nativeNewEnd.setUTCHours(
          originalEnd.getUTCHours(),
          originalEnd.getUTCMinutes(),
          originalEnd.getUTCSeconds(),
          originalEnd.getUTCMilliseconds()
        );
        const finalNewEnd = new TZDate(nativeNewEnd, timezone);

        expandedEvents.push({
          ...event,
          id: `${event.id}-${date.toISOString()}`, // Gera um ID único para cada instância
          start: finalNewStart.toISOString(),
          end: finalNewEnd.toISOString(),
          isRecurrenceInstance: true, // Marca como instância recorrente
          originalEventId: event.id, // Guarda o ID original para referência
        });
      }
    } catch (error) {
      console.error("Error expanding recurring event:", error, event);
      expandedEvents.push(event);
    }
  }

  return expandedEvents;
};

/**
 * Ensures that the provided date string or Date object is converted to a valid TZDate object.
 * It attempts to parse various date string formats, including ISO strings and strings with spaces.
 *
 * @param {string | Date} dateStr - The date string or Date object to ensure validity of.
 * @param {string} timezone - The timezone to use for the TZDate object.
 * @returns {TZDate} - A valid TZDate object. If parsing fails, returns the current date as TZDate as a fallback.
 */
export const ensureDate = (dateStr: string | Date, timezone: string): TZDate => {
  if (dateStr instanceof Date) {
    return new TZDate(dateStr, timezone);
  }

  try {
    if (typeof dateStr === "string") {
      if (dateStr.includes("T") || dateStr.endsWith("Z")) {
        // Caso já contenha "T" ou termine com "Z", assumimos que já tem fuso horário definido.
        return new TZDate(parseISO(dateStr), timezone);
      } else if (dateStr.includes(" ")) {
        // Adiciona "Z" após substituir o espaço por "T"
        return new TZDate(parseISO(dateStr.replace(" ", "T") + "Z"), timezone);
      } else {
        console.warn("Date string format is ambiguous, assuming YYYY-MM-DD format:", dateStr);
        // Assumindo que a string está no formato YYYY-MM-DD e queremos a meia-noite em UTC.
        return new TZDate(parseISO(dateStr + "T00:00:00Z"), timezone);
      }
    } else {
      console.warn("ensureDate received non-string and non-Date input:", dateStr);
      return new TZDate(new Date(), timezone);
    }
  } catch (e) {
    console.error("Error converting date string:", dateStr, e);
    return new TZDate(new Date(), timezone);
  }
};

