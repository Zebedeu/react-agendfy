import { getNewDate } from "./calendarNavigation";
import { addDays, addWeeks, addMonths } from "date-fns";

describe("getNewDate", () => {
  const baseDate = new Date("2025-03-15T00:00:00Z");

  test("should return next day for view 'day'", () => {
    const result = getNewDate(baseDate, "day", 1);
    const expected = addDays(baseDate, 1);
    expect(result.toISOString()).toBe(expected.toISOString());
  });

  test("should return previous day for view 'day'", () => {
    const result = getNewDate(baseDate, "day", -1);
    const expected = addDays(baseDate, -1);
    expect(result.toISOString()).toBe(expected.toISOString());
  });

  test("should return next week for view 'week'", () => {
    const result = getNewDate(baseDate, "week", 1);
    const expected = addWeeks(baseDate, 1);
    expect(result.toISOString()).toBe(expected.toISOString());
  });

  test("should return previous week for view 'week'", () => {
    const result = getNewDate(baseDate, "week", -1);
    const expected = addWeeks(baseDate, -1);
    expect(result.toISOString()).toBe(expected.toISOString());
  });

  test("should return next month for view 'month'", () => {
    const result = getNewDate(baseDate, "month", 1);
    const expected = addMonths(baseDate, 1);
    expect(result.toISOString()).toBe(expected.toISOString());
  });

  test("should return previous month for view 'month'", () => {
    const result = getNewDate(baseDate, "month", -1);
    const expected = addMonths(baseDate, -1);
    expect(result.toISOString()).toBe(expected.toISOString());
  });

  test("should return next month for view 'list'", () => {
    const result = getNewDate(baseDate, "list", 1);
    const expected = addMonths(baseDate, 1);
    expect(result.toISOString()).toBe(expected.toISOString());
  });

  test("should return previous month for view 'list'", () => {
    const result = getNewDate(baseDate, "list", -1);
    const expected = addMonths(baseDate, -1);
    expect(result.toISOString()).toBe(expected.toISOString());
  });

  test("should default to week when view is unrecognized", () => {
    const result = getNewDate(baseDate, "unknown", 1);
    const expected = addWeeks(baseDate, 1);
    expect(result.toISOString()).toBe(expected.toISOString());
  });
});
