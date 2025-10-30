import React, { useState, useEffect, useRef, FC } from "react";
import { Resource, FilterPluginProps } from "@react-agendfy/core";
import { Filter } from "lucide-react";

interface ResourceFilterPluginProps {
  resources?: Resource[];
  filteredResources?: string[];
  onResourceFilterChange?: (selected: string[]) => void;
  config?: {
    filter_resources?: string;
    clear_filter?: string;
  };
}

const ResourceFilterComponent: FC<ResourceFilterPluginProps> = ({
  resources = [],
  filteredResources = [],
  onResourceFilterChange,
  config,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResourceChange = (resourceId: string, isChecked: boolean) => {
    if (!onResourceFilterChange) return;
    const newSelected = isChecked
      ? [...filteredResources, resourceId]
      : filteredResources.filter((id: string) => id !== resourceId);
    onResourceFilterChange(newSelected);
  };

  const handleClearFilters = () => {
    if (!onResourceFilterChange) return;
    onResourceFilterChange([]);
    setIsFilterOpen(false);
  };

  if (resources.length === 0) return null;

  return (
    <div className="fc-filter-container" ref={filterRef}>
      <button type="button" className="fc-filter-button fc-button fc-button-primary" onClick={() => setIsFilterOpen(!isFilterOpen)}>
        <Filter className="fc-icon" size={16} />
        <span>{config?.filter_resources || "Filter"}{filteredResources.length > 0 && ` (${filteredResources.length})`}</span>
      </button>
      {isFilterOpen && (
        <div className="fc-filter-dropdown">
          {resources.map((resource: Resource) => (
            <label key={resource.id} className="fc-filter-option">
              <input type="checkbox" value={resource.id} checked={filteredResources.includes(resource.id)} onChange={(e) => handleResourceChange(resource.id, e.target.checked)} />
              <span>{resource.name}</span>
            </label>
          ))}
          <button className="fc-clear-filter" onClick={handleClearFilters}>
            {config?.clear_filter || "Clear"}
          </button>
        </div>
      )}
    </div>
  );
};

const resourceFilterPlugin = {
  type: 'filter',
  component: ResourceFilterComponent,
  key: 'resource-filter-plugin',
};

export default resourceFilterPlugin;