import { TZDate } from "@date-fns/tz";
import { CalendarPlugin } from "./plugins";

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

export interface MonthViewProps {
  events?: EventProps[];
  resources?: Resource[];
  currentDate?: TZDate;
  onEventUpdate?: (updatedEvent: EventProps) => void;
  onEventResize?: (updatedEvent: EventProps) => void;
  onDateRangeSelect?: (range: EventProps) => void;
  onDayClick?: (day: Date) => void;
  onEventClick?: (event: EventProps) => void;
  config: Config;
  showResourceView?: boolean;
}

export interface EventProps {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  allDay?: boolean;
  color?: string;
  resourceId?: string | number;
  resourceIds?: (string | number)[];
  [key: string]: any;
}

export interface Resource {
  id: string | number;
  title: string;
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
export interface DayColumnProps {
  dayDate: any;
  events: EventProps[];
  getEventsForDay: (dayDate: Date) => EventProps[];
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
