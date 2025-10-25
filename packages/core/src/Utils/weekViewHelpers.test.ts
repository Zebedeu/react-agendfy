// weekViewHelpers.test.ts
import { format, startOfWeek } from "date-fns";
import { TZDate } from "@date-fns/tz";
import {
  calculateNumberOfSlots,
  getCurrentWeekStart,
  generateDaysOfWeek,
  generateTimeSlots,
  getEventsForSlot,
} from "./weekViewHelpers";
import { EventProps } from "../types";

describe("weekViewHelpers", () => {
  test("calculateNumberOfSlots returns the correct number", () => {
    const slotMin = "8";
    const slotMax = "18";
    const slotDuration = 30; // minutes
    // Expected: ((18 - 8) * 60) / 30 = (10 * 60) / 30 = 20
    const slots = calculateNumberOfSlots(slotMin, slotMax, slotDuration);
    expect(slots).toBe(20);
  });

  test("getCurrentWeekStart returns the start of the week", () => {
    const currentDate = new Date("2023-03-15T10:00:00Z");
    const timeZone = "UTC";
    const weekStart = getCurrentWeekStart(currentDate, timeZone);
    const expected = startOfWeek(new TZDate(currentDate, timeZone), { weekStartsOn: 0 });
    expect(format(weekStart, "yyyy-MM-dd")).toEqual(format(expected, "yyyy-MM-dd"));
  });

  test("generateDaysOfWeek returns an array of 7 days", () => {
    const days = generateDaysOfWeek();
    expect(days).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  test("generateTimeSlots returns an array with the correct number of slots", () => {
    const numberOfSlots = 20;
    const slots = generateTimeSlots(numberOfSlots);
    expect(slots.length).toBe(20);
    expect(slots[0]).toBe(0);
    expect(slots[19]).toBe(19);
  });

  test("getEventsForSlot returns non-recurring event when times match", () => {
    const config = { timeZone: "UTC" };
    // Use a known slot time string (UTC)
    const slotTime = "2023-03-15T08:00:00.000Z";
    // Dummy event that starts at 08:00 and ends at 09:00 UTC.
    const event: EventProps = {
      id: "1",
      title: "Test Event",
      start: "2023-03-15T08:00:00.000Z",
      end: "2023-03-15T09:00:00.000Z",
    } as EventProps;
    const events = [event];
    const result = getEventsForSlot(slotTime, events, config);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("1");
  });

  test("getEventsForSlot returns no event when times do not match", () => {
    const config = { timeZone: "UTC" };
    const slotTime = "2023-03-15T10:00:00.000Z";
    const event: EventProps = {
      id: "1",
      title: "Test Event",
      start: "2023-03-15T08:00:00.000Z",
      end: "2023-03-15T09:00:00.000Z",
    } as EventProps;
    const events = [event];
    const result = getEventsForSlot(slotTime, events, config);
    expect(result.length).toBe(0);
  });
});
