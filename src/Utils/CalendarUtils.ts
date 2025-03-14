import { EventProps } from "../types";
import { generateICalContent } from "../Utils/downlaodEvent";
import { filterEvents } from "../Utils/calendarHelpers";

/**
 * Atualiza a lista de eventos com base em um evento atualizado ou uma lista de eventos.
 */
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

/**
 * Retorna os eventos filtrados com base nos filtros de recursos e plugins.
 */
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

/**
 * Gera e dispara o download do arquivo iCal contendo os eventos filtrados.
 */
export const exportCalendarEvents = (
  filteredEvents: EventProps[],
  localeConfig: any
) => {
  const iCalContent = generateICalContent(filteredEvents, localeConfig);
  const filename = "events.ics";
  const blob = new Blob([iCalContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
