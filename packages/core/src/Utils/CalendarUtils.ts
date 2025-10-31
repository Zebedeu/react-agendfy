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
}
