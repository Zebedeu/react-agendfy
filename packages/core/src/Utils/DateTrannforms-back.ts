process.env.TZ = 'UTC'; // Força a execução dos testes em UTC

import { TZDate } from "@date-fns/tz";
import { addMinutes, parseISO } from "date-fns";
import { expandRecurringEvents, ensureDate } from "./DateTrannforms"; // ajuste o caminho conforme necessário

describe("expandRecurringEvents", () => {
  it("should return non-recurring events unchanged", () => {
    const events = [
      {
        id: "nonrec",
        title: "Non Recurring Event",
        start: "2023-01-01T10:00:00Z",
        end: "2023-01-01T11:00:00Z",
      },
    ];
    const expanded = expandRecurringEvents(
      events,
      "2023-01-01T00:00:00Z",
      "2023-01-02T00:00:00Z",
      "UTC"
    );
    expect(expanded).toEqual(events);
  });

/*   it("should expand recurring events using minutes for duration", () => {
    // Evento recorrente diário, com 3 ocorrências
    const event = {
      id: "1",
      title: "Recurring Event",
      start: "2023-01-01T08:00:00Z",
      end: "2023-01-01T09:30:00Z", // duração: 90 minutos
      recurrence: "DTSTART:20230101T080000Z\nRRULE:FREQ=DAILY;COUNT=3",
    };

    const expanded = expandRecurringEvents(
      [event],
      "2023-01-01T00:00:00Z",
      "2023-01-05T00:00:00Z",
      "UTC"
    );
    // Espera 3 ocorrências
    expect(expanded).toHaveLength(3);

    expanded.forEach((instance, index) => {
      // Data de ocorrência: 2023-01-01 + index dias, às 08:00:00 UTC
      const occurrenceDate = new Date(Date.UTC(2023, 0, 1 + index, 8, 0, 0));
      const expectedStart = occurrenceDate.toISOString();
      // A duração é de 90 minutos; portanto, o fim esperado é às 09:30:00 UTC
      const expectedEnd = addMinutes(occurrenceDate, 90).toISOString();

      expect(instance.start).toBe(expectedStart);
      expect(instance.end).toBe(expectedEnd);
      expect(instance.isRecurrenceInstance).toBe(true);
      expect(instance.originalEventId).toBe("1");
      expect(instance.id).toBe(`1-${occurrenceDate.toISOString()}`);
    });
  });
 */
  it("should return an empty array if no occurrences fall within the range", () => {
    const event = {
      id: "1",
      title: "Recurring Event",
      start: "2023-01-01T08:00:00Z",
      end: "2023-01-01T09:00:00Z",
      recurrence: "DTSTART:20230101T080000Z\nRRULE:FREQ=DAILY;COUNT=3",
    };
    const expanded = expandRecurringEvents(
      [event],
      "2022-12-25T00:00:00Z",
      "2022-12-31T23:59:59Z",
      "UTC"
    );
    expect(expanded).toHaveLength(0);
  });
});

describe("ensureDate", () => {
  const timezone = "UTC";

  it("should return a TZDate for a Date input", () => {
    const inputDate = new Date("2023-01-01T10:00:00Z");
    const result = ensureDate(inputDate, timezone);
    expect(result.getTime()).toBe(new TZDate(inputDate, timezone).getTime());
  });

  it("should parse an ISO string with 'T' or ending with 'Z' correctly", () => {
    const inputStr = "2023-01-01T10:00:00Z";
    const result = ensureDate(inputStr, timezone);
    const expected = new TZDate(parseISO(inputStr), timezone).toISOString();
    expect(result.toISOString()).toBe(expected);
  });

  it("should parse a date string with space separator correctly", () => {
    const inputStr = "2023-01-01 10:00:00";
    const result = ensureDate(inputStr, timezone);
    const expectedTimestamp = new Date("2023-01-01T10:00:00.000Z").getTime();
    expect(new Date(result.toISOString()).getTime()).toBe(expectedTimestamp);
  });
  
  it("should parse an ambiguous date string (YYYY-MM-DD) as midnight", () => {
    const inputStr = "2023-01-01";
    const result = ensureDate(inputStr, timezone);
    const expectedTimestamp = new Date("2023-01-01T00:00:00.000Z").getTime();
    expect(new Date(result.toISOString()).getTime()).toBe(expectedTimestamp);
  });
  
/*   it("should return a fallback current date if parsing fails", () => {
    const inputStr = "invalid-date-string";
    const now = new Date();
    const result = ensureDate(inputStr, timezone);
    const diff = Math.abs(result.getTime() - now.getTime());
    expect(diff).toBeLessThan(5000); // fallback should be within 5 seconds
  }); */
});
