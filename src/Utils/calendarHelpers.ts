// src/Utils/calendarHelpers.js

// Define o recurso padrão para eventos sem recursos
export const defaultResource = {
    id: "default",
    name: "Geral",
    // Adicione outras propriedades, como 'icon', se necessário
  };
  
  // Função para normalizar os eventos
  export function normalizeEvents(events) {
    return events.map((event) => {
      if (!event.resources || event.resources.length === 0) {
        return { ...event, resources: [defaultResource] };
      }
      return event;
    });
  }
  
  // Função para filtrar os eventos com base nos recursos filtrados
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
  