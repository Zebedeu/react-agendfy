import {
    differenceInMinutes,
    isSameDay,
    setHours,
    startOfDay,
  } from "date-fns";
  import { TZDate } from "@date-fns/tz";
  
  export const calculateRedLineOffset = (
    currentDate: Date,
    parsedSlotMin: number,
    slotDuration: number,
    timeZone?: string
  ): number => {
    const now = new TZDate(new Date(), timeZone);
    const isToday = isSameDay(currentDate, now);
    let redLineOffset = 0;
  
    if (isToday) {
      const viewStart = setHours(startOfDay(now), parsedSlotMin);
      let diffMinutes = differenceInMinutes(now, viewStart);
      if (diffMinutes < 0) diffMinutes = 0;
      redLineOffset = (diffMinutes / (slotDuration || 30)) * 40;
    }
  
    return redLineOffset;
  };