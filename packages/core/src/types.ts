import { FC, ReactNode } from "react";
import { EmailAdapter } from "./types/notification";
import { CalendarPlugin } from "./types/plugns";
import { TZDate } from "@date-fns/tz";

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
  background?: string
  positionStyle?: EventPositionStyle;
  [key: string]: any;
}

export interface Resource {
  id: string;
  name: string;
  type: "room" | "person" | "equipment" | string;
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
    intervals: {
      daysOfWeek: number[];
      startTime: string;
      endTime: string;
    }[];
  },
  alerts?: {
    enabled: boolean,          
    thresholdMinutes: number,  
  },
  emailAdapter?: null,
  export?: boolean,
  calendar_export: string,
  [key: string]: any;
 

}

export interface CalendarProps {
  events?: EventProps[];
  onEventUpdate?: (events: EventProps) => void;
  onEventResize?: (events: EventProps) => void;
  onDateRangeSelect?: (events: EventProps) => void;
  onEventClick?: (event: EventProps) => void;
  onDayClick?: (date: Date) => void;
  onSlotClick?: (date: Date) => void;
  config?: Config;
  theme: string;
  resources?: Resource[];
  filteredResources?: string[];
  emailAdapter?: EmailAdapter;
  emailConfig?: {
    defaultRecipient: string;
  };
  plugins?: CalendarPlugin;
  customViews?: Record<string, FC<any>>;


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
  currentDate: TZDate;
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
   eventRenderingPlugins?: CalendarPlugin[];
    onSelectionMouseDown?: (date: Date) => void;
    onSelectionMouseMove: (date: Date) => void;
    isSlotSelected: (date: Date) => boolean;
  parsedSlotMin: number;
  parsedSlotMax: number;
  redLineOffset: number;
  config?: Config;
  isDraggable: boolean;
}

export interface WeekProps  {
  events:EventProps[],
  onEventUpdate?: (event: EventProps) => void;
  onEventClick?: (event: EventProps) => void;
  onSlotClick?: (slotTime: Date) => void;
  onEventResize?: (event: EventProps) => void;
  onDateRangeSelect?: (event: EventProps) => void;
  currentDate: TZDate,
  slotMin: string,
  slotMax: string,
  config: Config,
}

export interface ListViewProps {
  events: EventProps[];
  onEventClick?: (event: EventProps) => void; // Optional function prop
  currentDate: TZDate; // Or TZDate if you are consistently using TZDate
  config: Config; // Use CalendarConfigProps for config prop
}


export interface ListEventProps {
  event: EventProps;
  onEventClick?: (event: EventProps) => void; // Optional function prop
  currentDate: TZDate; // Or TZDate if you are consistently using TZDate
  config: Config; // Use CalendarConfigProps for config prop

}

// MonthView.types.ts

export interface MonthViewProps {
  events?: EventProps[];
  resources?: Resource[];
  currentDate?: TZDate;
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
  onMouseDown?: (day: Date) => void;
  onMouseMove?: (day: Date) => void;
  isSelected?: boolean;

  isDroppable?: boolean;
  isDropTarget?: boolean;
  config: Config;
}

export interface CalendarHeaderProps {
  view: "month" | "week" | "day" | string; 
  onViewChange: (view: string) => void;
  availableViews: { name: string; label: string }[];
  currentView: string;
  currentDate: Date | TZDate; 
  onNavigateToday: () => void;
  onNavigateBack: () => void;
  onNavigateForward: () => void;
  config?: Config;
  resources?: Resource[]; 
  onResourceFilterChange?: (filter: string) => void; 
  onDownloadcalendar?: (filter: string) => void;
  leftControls?: ReactNode | ReactNode;
  rightControls?: ReactNode | ReactNode;
}


// Defina a interface para um plugin de renderização de eventos
export interface EventRenderingPlugin {
  (props: {
    event: EventProps;
    config: any;
    dayDate: Date;
    onEventClick?: (event: EventProps) => void;
    onEventResize?: (event: EventProps, newEnd: Date) => void;
    positionStyle: React.CSSProperties;
    endHour: number;
    isDraggable?: boolean;
  }): React.ReactNode;
}