import { EventProps, Config } from "../types/types";
import { filterEvents } from "../Utils/calendarHelpers";



export const updateEventsList = (
  currentEvents: EventProps[],
  updatedEvent: EventProps | EventProps[]
): EventProps[] => {
  if (Array.isArray(updatedEvent)) {
    return updatedEvent;
  }
  if (updatedEvent && typeof updatedEvent === "object") {
    return currentEvents.map((event) =>
      event.id === updatedEvent.id ? updatedEvent : event
    );
  }
  return currentEvents;
};

export const getFilteredEventsList = (
  normalizedEvents: EventProps[],
  localFilteredResources: string[],
  pluginFilteredEvents: EventProps[],
  pluginSearchResults: EventProps[],
  isSearchActive: boolean
): EventProps[] => {
  const filteredByResource = filterEvents(normalizedEvents, localFilteredResources);
  const filteredByPlugin = pluginFilteredEvents.filter((event) =>
    filteredByResource.some((e: any) => e.id === event.id)
  );
  return isSearchActive
    ? pluginSearchResults.filter((event) =>
        filteredByPlugin.some((e) => e.id === event.id)
      )
    : filteredByPlugin;
};

export const downloadFile = (content: string, fileName: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToIcs = (events: EventProps[]): string => {
  let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//react-agendfy//EN\n";
  events.forEach((event) => {
    const startDate = new Date(event.start).toISOString().replace(/[-:]/g, "").split(".")[0];
    const endDate = new Date(event.end).toISOString().replace(/[-:]/g, "").split(".")[0];
    icsContent += "BEGIN:VEVENT\n";
    icsContent += `UID:${event.id}\n`;
    icsContent += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z\n`;
    icsContent += `DTSTART:${startDate}Z\n`;
    icsContent += `DTEND:${endDate}Z\n`;
    icsContent += `SUMMARY:${event.title}\n`;
    if (event.description) {
      icsContent += `DESCRIPTION:${event.description}\n`;
    }
    icsContent += "END:VEVENT\n";
  });
  icsContent += "END:VCALENDAR";
  return icsContent;
};

const exportToCsv = (events: EventProps[]): string => {
  const headers = ['id', 'title', 'start', 'end', 'isAllDay', 'color', 'description'];
  const rows = events.map(event => {
    const rowData = [
      `"${event.id}"`,
      `"${event.title}"`,
      `"${event.start}"`,
      `"${event.end}"`,
      event.isAllDay ? 'true' : 'false',
      `"${event.color || ''}"`,
      `"${event.description || ''}"`
    ];
    return rowData.join(',');
  });
  return [headers.join(','), ...rows].join('\n');
};

const exportToJson = (events: EventProps[]): string => {
  return JSON.stringify(events, null, 2);
};

export const exportCalendarEvents = (
  events: EventProps[],
  config: Config,
  format: "ics" | "csv" | "json" = "ics"
) => {
  let fileContent: string;
  let fileName: string;
  let mimeType: string;

  const dateStr = new Date().toISOString().split('T')[0];

  switch (format) {
    case "csv":
      fileContent = exportToCsv(events);
      fileName = `calendar-events-${dateStr}.csv`;
      mimeType = "text/csv;charset=utf-8;";
      break;
    case "json":
      fileContent = exportToJson(events);
      fileName = `calendar-events-${dateStr}.json`;
      mimeType = "application/json;charset=utf-8;";
      break;
    case "ics":
    default:
      fileContent = exportToIcs(events);
      fileName = `calendar-events-${dateStr}.ics`;
      mimeType = "text/calendar;charset=utf-8;";
      break;
  }

  downloadFile(fileContent, fileName, mimeType);
};
