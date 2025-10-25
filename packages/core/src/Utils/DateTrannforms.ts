import { TZDate } from "@date-fns/tz";
import { addMilliseconds, differenceInMilliseconds, parseISO, set } from "date-fns";
import { RRule } from "rrule";

interface CalendarEvent {
  id: string | number;
  start: string | Date;
  end: string | Date;
  recurrence?: string;
  [key: string]: any;
}

export const expandRecurringEvents = (
  events: CalendarEvent[],
  viewStartDate: Date,
  viewEndDate: Date,
  timezone?: string
): CalendarEvent[] => {
  const start = timezone
    ? new TZDate(viewStartDate, timezone)
    : viewStartDate;
  const end = timezone
    ? new TZDate(viewEndDate, timezone)
    : viewEndDate;

  const expandedEvents: CalendarEvent[] = [];

  events.forEach((event) => {
    // Se o evento não possui recorrência, adicionar diretamente
    if (!event.recurrence) {
      expandedEvents.push(event);
      return;
    }

    try {
      // Parse da string rrule
      const rule = RRule.fromString(event.recurrence);

      // Obtém as datas de ocorrência dentro do intervalo (inclusivo para between)
      const occurrences = rule.between(start, end, true);

      if (occurrences.length === 0) return;

      // Para cada ocorrência, cria um novo evento
      occurrences.forEach((date) => {
        // Prioriza o fuso horário da regra de recorrência (se existir),
        // caso contrário, usa o fuso horário da visualização.
        const eventTimezone = rule.options.tzid || timezone;

        const originalStartDate = ensureDate(event.start, eventTimezone);
        const originalEndDate = ensureDate(event.end, eventTimezone);
        const duration = differenceInMilliseconds(originalEndDate, originalStartDate);

        // Cria a nova data de início a partir da ocorrência, mas com a hora do evento original.
        // Usar `set` do date-fns é mais robusto e declarativo.
        const newStart = set(date, {
          hours: originalStartDate.getHours(),
          minutes: originalStartDate.getMinutes(),
          seconds: originalStartDate.getSeconds(),
          milliseconds: originalStartDate.getMilliseconds(),
        });

        // Calcula a nova data de término adicionando a duração original.
        const newEnd = addMilliseconds(newStart, duration);

        expandedEvents.push({
          ...event,
          id: `${event.id}-${date.toISOString()}`, // ID único para cada ocorrência
          start: newStart.toISOString(),
          end: newEnd.toISOString(),
          isRecurrenceInstance: true, // Flag para identificar que é uma instância de recorrência
          originalEventId: event.id, // Referência ao evento original
        });
      });
    } catch (error) {
      console.error("Error when expanding recurring event:", error);
      expandedEvents.push(event); // Em caso de erro, adiciona o evento original
    }
  });

  return expandedEvents;
};

// Função auxiliar para garantir que uma string de data seja um objeto Date válido

export const ensureDate = (
  dateInput: string | Date,
  timeZone?: string
): Date => {
  if (dateInput instanceof Date) {
    return timeZone ? new TZDate(dateInput, timeZone) : dateInput;
  }

  try {
    // parseISO é mais robusto e lida com vários formatos ISO 8601
    const parsedDate = parseISO(dateInput);
    return timeZone ? new TZDate(parsedDate, timeZone) : parsedDate;
  } catch (e) {
    console.error("Error converting date:", dateInput, e);
    // Retornar uma data inválida é mais seguro do que a data atual,
    // pois força o consumidor da função a tratar o erro.
    return new Date('invalid date');
  }
};
