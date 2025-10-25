import { useMemo } from "react";
import { format, setHours, setMinutes, startOfDay } from "date-fns";
import { TZDate } from "@date-fns/tz";

export const useTimeSlots = ({ startHour, endHour, slotDuration, currentDate, timeZone }) => {
  // Calculate number of slots
  const numberOfSlots = useMemo(
    () => ((endHour - startHour) * 60) / slotDuration,
    [startHour, endHour, slotDuration]
  );

  // Generate time slot indices
  const timeSlots = useMemo(() => 
    Array.from({ length: numberOfSlots }, (_, i) => i), 
    [numberOfSlots]
  );

  // Precompute timeslot labels
  const timeslotLabels = useMemo(() => {
    return timeSlots.map((index) => {
      const time = setMinutes(
        setHours(
          startOfDay(new TZDate(currentDate, timeZone)),
          startHour + Math.floor((index * slotDuration) / 60)
        ),
        (index * slotDuration) % 60
      );
      return format(time, "HH:mm");
    });
  }, [timeSlots, currentDate, timeZone, startHour, slotDuration]);

  return {
    numberOfSlots,
    timeSlots,
    timeslotLabels
  };
};