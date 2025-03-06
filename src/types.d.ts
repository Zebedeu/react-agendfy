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
  clier_filter?: string;
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