// src/Utils/calendarNavigation.js
import { addDays, addWeeks, addMonths } from "date-fns";

export function getNewDate(currentDate, view, direction) {
  switch (view) {
    case "day":
      return addDays(currentDate, direction);
    case "week":
      return addWeeks(currentDate, direction);
    case "month":
    case "list":
      return addMonths(currentDate, direction);
    default:
      return addWeeks(currentDate, direction);
  }
}
