import { EmailAdapter } from "./Utils/EmailAdapter";

export interface EventProps {
  id: string;
  title: string;
  start: string | Date;
  end: string | Date;
  color: string;
  isAllDay: boolean;
  isMultiDay: boolean;
  recurrence?: string;
  resources?: Resource[];
  positionStyle?: EventPositionStyle;
  [key: string]: any;
}

export interface Resource {
  id: string;
  name: string;
  type: "room" | "person" | "equipment";
}

export interface Config {
  timeZone: string,
  defaultView: "month" | "week" | "day";
  slotDuration: number;
  slotLabelFormat: string;
  slotMin: string;
  slotMax: string;
  lang: string;
  today: string;
  monthView: string;
  weekView: string;
  dayView: string;
  listView:string;
  all_day: string;
  filter_resources: string;
  clear_filter?: string;
  businessHours: {
    enabled: boolean,
    intervals: []
  },
  alerts?: {
    enabled: boolean,          
    thresholdMinutes: number,  
  },
  emailAdapter?: null
 

}

export interface CalendarProps {
  events?: EventProps[];
  onEventUpdate?: (events: EventProps) => void;
  onEventResize?: (events: EventProps) => void;
  onEventClick?: (event: EventProps) => void;
  onDayClick?: (date: Date) => void;
  onSlotClick?: (date: Date) => void;
  config?: Config;
  resources?: Resource[];
  filteredResources?: string[];
  emailAdapter?: EmailAdapter;
  emailConfig?: {
    defaultRecipient?: string;
  };
}

export interface BaseEventProps {
  event: EventProps;
  onEventClick?: (event: EventProps) => void;
  onEventUpdate?: (event: EventProps) => void;
  onEventResize?: (event: EventProps) => void;
  positionStyle?: PositionStyle;
  isPreview?: boolean;
  isMultiDay?: boolean;
  isStart?: boolean;
  isEnd?: boolean;
  config?: Config;
  dayDate?: any;
  isDraggable?: boolean;
  customClassName?: string;
  parsedSlotMax?: number;
}

export interface PositionStyle {
  top?: string | number;
  height?: string | number;
  [key: string]: any;
}

export type TimeSlotData = {
  [key: string]: number[];
};

export interface EventPositionStyle {
  left: string;
  width: string;
  top: string;
  marginLeft: string;
}

export interface TimeSlotProps {
  index: number;
  slotEvents: EventProps[];
  onEventUpdate?: (event: EventProps) => void;
  onSlotClick?: (event: Date) => void;
  onEventClick?: (event: EventProps) => void;
  onEventResize?: (event: EventProps) => void;
  parsedSlotMax: number;
  dayDate: any;
  slotMin: number;
  config?: Config;
  isDraggable?: boolean;
}

export interface DayViewProps {
  events: EventProps[];
  onEventUpdate?: (event: EventProps) => void;
  onEventClick?: (event: EventProps) => void;
  onSlotClick?: (slotTime: Date) => void;
  currentDate: Date;
  slotMin?: string;
  slotMax?: string;
  config?: Config;
}

export interface EventData {
  id: string;
  start: string;
  end: string;
  title: string;
  recurrence?: string;
  isMultiDay?: boolean;
  positionStyle?: EventPositionStyle;
  [key: string]: any;
}

export interface DayColumnProps {
  dayDate: any;
  events: EventProps;
  getEvents: (slotTime: string) => any;
  timeSlots: number[];
  onEventUpdate?: (event: EventProps) => void;
  onEventClick?: (event: EventProps) => void;
  onSlotClick?: (slotTime: Date) => void;
  onEventResize?: (event: EventProps) => void;
  parsedSlotMin: number;
  parsedSlotMax: number;
  redLineOffset: number;
  config?: Config;
  isDraggable: boolean;
}

export interface WeekProps  {
  events:EventProps,
  onEventUpdate?: (event: EventProps) => void;
  onEventClick?: (event: EventProps) => void;
  onSlotClick?: (slotTime: Date) => void;
  onDayClick?: (slotTime: Date) => void;
  onEventResize?: (event: EventProps) => void;
  currentDate: Date,
  slotMin: string,
  slotMax: string,
  config: Config,
}

interface ListEventProps {
  event: EventProps;
  onEventClick?: (event: EventProps) => void; // Optional function prop
  currentDate: Date; // Or TZDate if you are consistently using TZDate
  config: CalendarConfigProps; // Use CalendarConfigProps for config prop
}

// MonthView.types.ts

import { EventProps } from "../../../../types";
import { Locale } from "date-fns";

export interface MonthViewProps {
  events?: EventProps[];
  resources?: ResourceProps[];
  currentDate?: Date;
  onEventUpdate?: (updatedEvent: EventProps) => void;
  onEventResize?: (updatedEvent: EventProps) => void;
  onDayClick?: (day: Date) => void;
  onEventClick?: (event: EventProps) => void;
  config: Config;
  showResourceView?: boolean;
}

export interface CalendarDayProps {
  day: TZDate | null;
  events?: EventProps[];
  onDayClick?: (day: TZDate) => void;
  onEventClick?: (event: EventProps) => void;
  onEventResize?: (event: EventProps) => void;
  isDroppable?: boolean;
  isDropTarget?: boolean;
  config: Config;
}

export interface CalendarHeaderProps {
  view: "month" | "week" | "day" | string; // Você pode restringir as opções se necessário
  onViewChange: (view: string) => void;
  currentDate: Date | TZDate; // Pode ser Date ou TZDate, conforme sua implementação
  onNavigateToday: () => void;
  onNavigateBack: () => void;
  onNavigateForward: () => void;
  config: Config;
  resources?: Resource[]; // Recursos, opcionalmente, com valor padrão []
  onResourceFilterChange?: (filter: string) => void; // Callback para alteração de filtro de recursos
}

