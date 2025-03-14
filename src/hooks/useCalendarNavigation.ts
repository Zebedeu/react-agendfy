import { useCallback } from "react";
import { TZDate } from "@date-fns/tz";
import { getNewDate } from "../Utils/calendarNavigation";

interface UseCalendarNavigationProps {
  currentDate: Date;
  defaultView: string;
  timeZone: string;
  setCurrentDate: (date: Date) => void;
}

const useCalendarNavigation = ({
  currentDate,
  defaultView,
  timeZone,
  setCurrentDate,
}: UseCalendarNavigationProps) => {
  const navigateToday = useCallback(() => {
    setCurrentDate(new TZDate(new Date(), timeZone));
  }, [setCurrentDate, timeZone]);

  const navigateBack = useCallback(() => {
    const newDate = getNewDate(currentDate, defaultView, -1);
    setCurrentDate(new TZDate(newDate, timeZone));
  }, [currentDate, defaultView, setCurrentDate, timeZone]);

  const navigateForward = useCallback(() => {
    const newDate = getNewDate(currentDate, defaultView, 1);
    setCurrentDate(new TZDate(newDate, timeZone));
  }, [currentDate, defaultView, setCurrentDate, timeZone]);

  return { navigateToday, navigateBack, navigateForward };
};

export default useCalendarNavigation;
