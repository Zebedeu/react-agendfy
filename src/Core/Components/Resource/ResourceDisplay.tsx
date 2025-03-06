import React  from 'react';
import { ResourceIcon } from "./ResourceIcon";

const defaultResource = {
  id: "default",
  name: "Geral",
  // Você pode adicionar outras propriedades, como 'icon', se necessário
};

const ResourceDisplay = ({ resources, maxVisible = 2 }) => {
  // Se não houver recursos, utiliza o recurso padrão
  const resourceList =
    resources && resources.length > 0 ? resources : [defaultResource];

  const visibleResources = resourceList.slice(0, maxVisible);
  const hiddenCount = resourceList.length - maxVisible;

  return (
    <div data-testid="resource-display-container" className="flex items-center mt-0.5 text-xs">
      {visibleResources.map((resource, index) => (
        <ResourceIcon key={resource.id || index} resource={resource} />
      ))}
      {hiddenCount > 0 && (
        <span title={`${hiddenCount} more resources`} className="text-xs">
          +{hiddenCount}
        </span>
      )}
    </div>
  );
};

export default ResourceDisplay;
