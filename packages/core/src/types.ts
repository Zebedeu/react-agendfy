import { CalendarPlugin } from "./types/plugins";

export interface EventProps {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  allDay?: boolean;
  color?: string;
  /** Um único ID de recurso (para casos simples) */
  resourceId?: string | number;
  /** Uma lista de IDs de recursos para associar o evento a múltiplos recursos */
  resourceIds?: (string | number)[];
  [key: string]: any;
}

export interface Resource {
  id: string | number;
  title: string;
  /** Permite aninhar recursos para criar uma hierarquia */
  children?: Resource[];
  [key: string]: any;
}

export interface CalendarProps {
  events: EventProps[];
  resources?: Resource[];
  plugins?: CalendarPlugin[];
  currentDate?: Date;
  onEventClick?: (event: EventProps) => void;
  onDateChange?: (date: Date) => void;
  [key: string]: any;
}