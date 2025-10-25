import React from 'react';
import { ResourceIcon } from "./ResourceIcon";
import { Resource } from '../../types';

const defaultResource: Resource = {
  id: "default",
  name: "Geral",
  type: "equipment",
};

const ResourceDisplay = ({ resources, maxVisible = 2 }: { resources: Resource[], maxVisible: number}) => {
  const resourceList = resources && resources.length > 0 ? resources : [defaultResource];

  const visibleResources = resourceList.slice(0, maxVisible);
  const hiddenCount = resourceList.length - maxVisible;

  return (
    <div data-testid="resource-display-container" className="react-agenfy-resource-display-container">
      {visibleResources.map((resource: Resource, index: number) => (
        <ResourceIcon key={resource.id || index} resource={resource} />
      ))}
      {hiddenCount > 0 && (
        <span title={`${hiddenCount} more resources`} className="react-agenfy-resource-display-hidden-text">
          +{hiddenCount}
        </span>
      )}
    </div>
  );
};

export default ResourceDisplay;
