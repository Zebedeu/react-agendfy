
export const defaultResource = {
    id: "default",
    name: "Geral",
  };
  
  export function normalizeEvents(events) {
    return events.map((event) => {
      if (!event.resources || event.resources.length === 0) {
        return { ...event, resources: [defaultResource] };
      }
      return event;
    });
  }
  
  export function filterEvents(events, localFilteredResources) {
    return events.filter((event) => {
      if (!event.resources) {
        return localFilteredResources.length === 0;
      }
      return (
        localFilteredResources.length === 0 ||
        event.resources.some((resource) => localFilteredResources.includes(resource.id))
      );
    });
  }
  