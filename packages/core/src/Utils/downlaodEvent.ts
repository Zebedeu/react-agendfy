import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';
import { Config, EventProps } from '../types';
import { getLocale } from './locate';

export const generateICalContent = (events: EventProps[], config: Config) => {
  let iCalString = `BEGIN:VCALENDAR\r\n`;
  iCalString += `VERSION:2.0\r\n`;
  iCalString += `PRODID:-//React Agendfy//React Agendfy//EN\r\n`;


  events.forEach((event: EventProps) => {
    const uid = `event-${event.id}-${Date.now()}`;
    const now = new Date();
    const zonedNow = new TZDate(now, getLocale(config.timeZone));
    const dtstamp = format(zonedNow, 'yyyyMMdd\'T\'HHmmss\'Z\'', { locale: getLocale(config.timeZone) }); // DTSTAMP em UTC

    const zonedStart = new TZDate(event.start, getLocale(config.timeZone));
    const dtstart = format(zonedStart, 'yyyyMMdd\'T\'HHmmss');
    const dtstartTZID = getLocale(config.timeZone).code;

    const zonedEnd = new TZDate(event.end,  getLocale(config.timeZone));
    const dtend = format(zonedEnd, 'yyyyMMdd\'T\'HHmmss');
    const dtendTZID = getLocale(config.timeZone).code;

    const summary = event.title;
    const description = event.description ? event.description.replace(/\n/g, '\\n') : '';
    const location = event.location || '';

    iCalString += `BEGIN:VEVENT\r\n`;
    iCalString += `UID:${uid}\r\n`;
    iCalString += `DTSTAMP:${dtstamp}\r\n`;
    iCalString += `DTSTART;TZID=${dtstartTZID}:${dtstart}\r\n`;
    iCalString += `DTEND;TZID=${dtendTZID}:${dtend}\r\n`;
    iCalString += `SUMMARY:${summary}\r\n`;
    if (description) {
      iCalString += `DESCRIPTION:${description}\r\n`;
    }
    if (location) {
      iCalString += `LOCATION:${location}\r\n`;
    }
    iCalString += `END:VEVENT\r\n`;
  });

  iCalString += `END:VCALENDAR\r\n`;
  return iCalString;
};