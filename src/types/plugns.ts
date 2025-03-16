import { FC, ReactNode } from "react";

export interface CalendarPlugin {
    type: 'header' | 'view' | 'eventRenderer' | 'slotRenderer' | 'interaction' | 'filter' | 'search' | 'dataSource' | 'eventRenderer';
    location?: 'left' | 'right' | string;
    viewName?: string;
    rendererType?: 'event' | 'slot';
    render?: (props: any) => ReactNode;
    component?: FC<any>;
    props?: Record<string, any>;
    key?: string | number;
  }
