import type { EventProps, Config } from '@react-agendfy/core';
import { downloadBlob } from '@react-agendfy/core';

const sanitize = (value: any): string => {
  const s = (value ?? "").toString().trim();
  return `"${s.replace(/"/g, '""')}"`;
};

const downloadFile = (content: string, fileName: string, mimeType: string) => {
  downloadBlob(new Blob([content], { type: mimeType }), fileName);
};


const exportToCsv = (events: EventProps[]): string => {
  const headers = ["id", "title", "start", "end", "isAllDay", "color", "description"];
  const rows = events.map(event =>
    [
      sanitize(event.id),
      sanitize(event.title),
      sanitize(event.start),
      sanitize(event.end),
      event.isAllDay ? "true" : "false",
      sanitize(event.color),
      sanitize(event.description),
    ].join(",")
  );
  return [headers.join(","), ...rows].join("\n");
};

const exportToJson = (events: EventProps[]): string =>
  JSON.stringify(events, null, 2);

const exportToIcs = (events: EventProps[]): string => {
  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//react-agendfy//EN",
  ];
  events.forEach((event) => {
    const start = new Date(event.start).toISOString().replace(/[-:]/g, "").split(".")[0];
    const end = new Date(event.end).toISOString().replace(/[-:]/g, "").split(".")[0];
    icsLines.push(
      "BEGIN:VEVENT", 
      `UID:${event.id}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART:${start}Z`,
      `DTEND:${end}Z`,
      `SUMMARY:${event.title}`,
      event.description ? `DESCRIPTION:${event.description}` : "",
      "END:VEVENT"
    );
  });
  icsLines.push("END:VCALENDAR");
  return icsLines.join("\n");
};

const exportCalendarEvents = async (
  events: EventProps[],
  config: Config,
  format: "csv" | "ics" | "json" = "csv"
): Promise<string> => {
  try {
    if (!events || !Array.isArray(events)) throw new Error("Invalid events array.");

    const date = new Date().toISOString().split("T")[0];
    let fileContent = "";
    let fileName = `calendar-export-${date}.${format}`;
    let mimeType = "text/plain;charset=utf-8;";

    switch (format) {
      case "csv":
        fileContent = exportToCsv(events);
        mimeType = "text/csv;charset=utf-8;";
        break;
      case "ics":
        fileContent = exportToIcs(events);
        mimeType = "text/calendar;charset=utf-8;";
        break;
      case "json":
        fileContent = exportToJson(events);
        mimeType = "application/json;charset=utf-8;";
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    if (config?.autoDownload !== false && typeof window !== "undefined") {
      downloadFile(fileContent, fileName, mimeType);
    }

    return fileContent;
  } catch (err) {
    console.error("Error exporting events:", err);
    throw err;
  }
};

const csvExportPlugin = {
  key: "csv-export-plugin",
  type: "export" as const,
  formatName: "csv",
  label: "Export to CSV",
  fileExtension: "csv",
  mimeType: "text/csv;charset=utf-8;",
  exportFunction: (events: EventProps[], config: Config) =>
    exportCalendarEvents(events, config, "csv"),
};

const jsonExportPlugin = {
  key: "json-export-plugin",
  type: "export" as const,
  formatName: "json",
  label: "Export to JSON",
  fileExtension: "json",
  mimeType: "application/json;charset=utf-8;",
  exportFunction: (events: EventProps[], config: Config) =>
    exportCalendarEvents(events, config, "json"),
};

const icsExportPlugin = {
  key: "ics-export-plugin",
  type: "export" as const,
  formatName: "ics",
  label: "Export to ICS",
  fileExtension: "ics",
  mimeType: "text/calendar;charset=utf-8;",
  exportFunction: (events: EventProps[], config: Config) =>
    exportCalendarEvents(events, config, "ics"),
};

const reportsExportPlugin = [csvExportPlugin, jsonExportPlugin, icsExportPlugin];

export default reportsExportPlugin;
