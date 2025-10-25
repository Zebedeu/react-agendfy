import { useEffect, useState } from "react";
import { addMinutes, isAfter } from "date-fns";
import { config } from "../Utils/config";
import { TZDate } from "@date-fns/tz";
import { UseEventReminderProps } from "../types/notification";


export const useEventReminder = ({
  events,
  notificationService,
  addToast,
  alertConfig,
}: UseEventReminderProps) => {
  const [alertedEvents, setAlertedEvents] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!alertConfig.enabled) return;

    const intervalId = setInterval(() => {
      const now = new TZDate(new Date(), config.timeZone);

      events.forEach((event) => {
        if (!event.alertBefore || alertedEvents.has(event.id)) return;

        const eventStart = new TZDate(event.start.toString(), config.timeZone);

        if (isAfter(now, eventStart)) {
          return; // Sai do loop para este evento
        }

        const alertTime = addMinutes(eventStart, -event.alertBefore);

        const isNowAlertTime = now.getTime() === alertTime.getTime();

        if (isAfter(now, alertTime) || isNowAlertTime) {
          notificationService.notifyEvent(event, addToast);
          setAlertedEvents((prev) => new Set(prev).add(event.id));
        }
      });
    }, 60000);

    return () => clearInterval(intervalId);
  }, [events, alertedEvents, alertConfig, addToast, notificationService]);
};