import { TZDate } from "@date-fns/tz";
import { addDays, differenceInDays, parseISO } from "date-fns";
import { RRule } from "rrule";

// Função para expandir eventos recorrentes
export const expandRecurringEvents = (events, startDate, endDate, timezone) => {

  // Converte startDate e endDate para objetos Date se necessário
  const start = typeof startDate === "string" ? new TZDate(parseISO(startDate), timezone) : new TZDate(startDate, timezone);
  const end = typeof endDate === "string" ? new TZDate(parseISO(endDate), timezone) : new TZDate(endDate, timezone);

  let expandedEvents = [];

  events.forEach((event) => {
    // Se o evento não possui recorrência, adiciona diretamente
    if (!event.recurrence) {
      expandedEvents.push(event);
      return;
    }

    try {
      // Parse da string rrule
      const rule = RRule.fromString(event.recurrence);

      // Obtém as datas de ocorrência dentro do intervalo (inclusivo)
      const occurrences = rule.between(start, end, true);

      if (occurrences.length === 0) return;

      // Para cada ocorrência, cria um novo evento
      occurrences.forEach((date) => {
        const eventStart = parseISO(event.start);
        const eventEnd = parseISO(event.end);
        const duration = differenceInDays(eventEnd, eventStart);

        // Cria uma nova data de início mantendo a hora original
        const newStart = new Date(date);
        newStart.setHours(
          eventStart.getHours(),
          eventStart.getMinutes(),
          eventStart.getSeconds()
        );

        // Calcula a nova data de término
        const newEnd = addDays(newStart, duration);
        newEnd.setHours(
          eventEnd.getHours(),
          eventEnd.getMinutes(),
          eventEnd.getSeconds()
        );

        expandedEvents.push({
          ...event,
          id: `${event.id}-${date.toISOString()}`, // ID único para cada ocorrência
          start: newStart.toISOString(),
          end: newEnd.toISOString(),
          isRecurrenceInstance: true,
          originalEventId: event.id,
        });
      });
    } catch (error) {
      console.error("Eerror when expanding recurring event:", error);
      expandedEvents.push(event); // Em caso de erro, adiciona o evento original
    }
  });

  return expandedEvents;
};

// Função auxiliar para garantir que uma string de data seja um objeto Date válido
export const ensureDate = (dateStr) => {
  if (dateStr instanceof Date) return dateStr;

  try {
    if (dateStr.includes("T") || dateStr.includes("Z")) {
      return  parseISO(dateStr);
    } else {
      return new Date(dateStr.replace(" ", "T"));
    }
  } catch (e) {
    console.error("Error converting date:", dateStr, e);
    return new Date(); // Fallback para data atual
  }
};