export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId?: string;
  color?: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
}

export type ViewType = 'day' | 'week' | 'month' | 'agenda';

export interface CalendarProps {
  events: CalendarEvent[];
  view?: ViewType;
  onEventClick?: (event: CalendarEvent) => void;
  onEventUpdate?: (event: CalendarEvent) => Promise<void>;
  timezone?: string;
}