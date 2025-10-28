import { FC } from 'react';
import { Config, EventProps } from './types';

/** Evento básico esperado pelos plugins (alinha com EventProps) */
export interface EventLike extends EventProps { // EventProps já contém resourceId e resourceIds
  [k: string]: any;
}

/** Configuração básica esperada pelos plugins (alinha com Config) */
export interface ConfigLike extends Config {
  [k: string]: any;
}

export interface BaseCalendarPlugin {
  key: string;
  location?: 'header' | 'view' | 'event' | 'slot' | 'data-source' | 'theme' | 'export' | 'filter' | 'interaction';
  type: 'filter' | 'search' | 'data-source' | 'view' | 'event-rendering' | 'interaction' | 'theme' | 'export' | 'custom-filter' | 'ui';
  props?: Record<string, any>;
}

export interface ViewPlugin extends BaseCalendarPlugin {
  type: 'view';
  viewName: string;
  component: FC<any>;
  props?: { label?: string; [key: string]: any };
}

export interface HeaderControlPlugin extends BaseCalendarPlugin {
  type: 'filter' | 'search';
  location: 'header' | 'left' | 'right';
  component: FC<any>;
  onFilterChange?: (filteredEvents: EventProps[]) => void;
  onSearch?: (searchTerm: string, results: EventProps[]) => void;
  events?: EventProps[];
  config?: Config;
}

export interface DataSourcePlugin extends BaseCalendarPlugin {
  type: 'data-source';
  fetchEvents: (startDate: Date, endDate: Date, config?: ConfigLike) => Promise<EventLike[]>;
}

export interface EventRenderingPlugin extends BaseCalendarPlugin {
  type: 'event-rendering';
  component: FC<any>;
}

export interface InteractionPlugin extends BaseCalendarPlugin {
  type: 'interaction';
  viewName: string;
  component: FC<any>;
}

export interface ThemePlugin extends BaseCalendarPlugin {
  type: 'theme';
  themeName: string;
  cssVariables?: Record<string, string>;
  component?: FC<{ children: React.ReactNode }>;
}

export interface ExportPlugin extends BaseCalendarPlugin {
  type: 'export';
  formatName: string;
  label: string;
  exportFunction: (events: EventLike[], config?: ConfigLike) => Promise<Blob | string>;
  mimeType: string;
  fileExtension: string;
}

export interface CustomFilterPlugin extends BaseCalendarPlugin {
  type: 'custom-filter';
  filterName: string;
  applyFilter: (events: EventProps[], config: Config, filterValue: any) => EventProps[];
  component?: FC<any>;
}

export interface UIPlugin extends BaseCalendarPlugin {
  type: 'ui' | 'search' | 'filter';
  component: FC<any>;
}

export type CalendarPlugin =
  | ViewPlugin | HeaderControlPlugin | DataSourcePlugin | EventRenderingPlugin
  | InteractionPlugin | ThemePlugin | ExportPlugin | CustomFilterPlugin | UIPlugin;