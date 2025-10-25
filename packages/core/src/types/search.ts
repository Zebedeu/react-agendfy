import { Config, EventProps } from "../types";

export interface FilterPluginProps {
    events: EventProps;
    onFilterChange: (filteredEvents: EventProps) => void;
    config: Config;
  }
  
  export interface SearchPluginProps {
    events: EventProps;
    onSearch: (searchTerm: string) => EventProps;
    config: Config;
  }
  
  