import { FC } from 'react';
import { Config, EventProps } from '../types';

export interface BaseCalendarPlugin {
  key: string;
  location?: 'header' | 'view' | 'event' | 'slot' | 'data-source' | 'theme' | 'export' | 'filter' | 'interaction';
  type: 'filter' | 'search' | 'data-source' | 'view' | 'event-rendering' | 'interaction' | 'theme' | 'export' | 'custom-filter';
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
  location: 'header';
  component: FC<any>;
  onFilterChange?: (filteredEvents: EventProps[]) => void;
  onSearch?: (searchTerm: string, results: EventProps[]) => void;
  events?: EventProps[];
  config?: Config;
}

export interface DataSourcePlugin extends BaseCalendarPlugin {
  type: 'data-source';
  fetchEvents: (startDate: Date, endDate: Date, config: Config) => Promise<EventProps[]>;
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
  exportFunction: (events: EventProps[], config: Config) => string | Promise<string>;
  mimeType: string;
  fileExtension: string;
}

export interface CustomFilterPlugin extends BaseCalendarPlugin {
  type: 'custom-filter';
  filterName: string;
  applyFilter: (events: EventProps[], config: Config, filterValue: any) => EventProps[];
  component?: FC<any>;
}

export type CalendarPlugin =
  | ViewPlugin | HeaderControlPlugin | DataSourcePlugin | EventRenderingPlugin
  | InteractionPlugin | ThemePlugin | ExportPlugin | CustomFilterPlugin;

export type PluginLocation = 'left' | 'right' | 'header' | 'footer';

export interface BasePlugin {
  key: string;
  type: string;
  description?: string;
  enabled?: boolean;
}

/** Evento básico esperado pelos plugins (alinha com CalendarEvent) */
export interface EventLike {
  id: string;
  title?: string;
  start: string | Date;
  end?: string | Date;
  color?: string;
  isAllDay?: boolean;
  [k: string]: any;
}

export interface ConfigLike {
  [k: string]: any;
}

/** Export plugin - responsável por gerar/retornar conteúdo exportável */
export interface ExportPlugin extends BasePlugin {
  type: 'export';
  formatName: string; // ex: 'pdf' | 'csv'
  label: string;
  mimeType?: string;
  fileExtension?: string;
  options?: Record<string, any>;
  exportFunction: (events: EventLike[], config?: ConfigLike) => Promise<Blob | string>;
}

/** Theme plugin - aplica CSS variables */
export interface ThemePlugin extends BasePlugin {
  type: 'theme';
  themeName: string;
  cssVariables: Record<string, string>;
  activate?: () => void;
  deactivate?: () => void;
}

/** Data source plugin - busca eventos externos (Google Calendar etc) */
export interface DataSourcePlugin extends BasePlugin {
  type: 'data-source';
  name: string;
  fetchEvents: (startDate: Date, endDate: Date, config?: ConfigLike) => Promise<EventLike[]>;
  options?: Record<string, any>;
}

/** View plugin - adiciona uma view customizável ao calendário */
export interface ViewPlugin extends BasePlugin {
  type: 'view';
  viewName: string;
  component: any; // React component
  props?: Record<string, any>;
}

/** Header / UI plugin */
export interface UIPlugin extends BasePlugin {
  type: 'ui' | 'search' | 'filter';
  location?: PluginLocation;
  component: any; // React component
  props?: Record<string, any>;
}