import './index.css';
import React from "react";
import {
  CalendarProps,
  EventProps,
  Resource,
} from "./types";
import {
  NotificationServiceConfig,
  EmailAdapter,
} from "./types/notification";
import {
  DataSourceConfigProps,
} from "./types/dataSource";
import {
  FilterPluginProps,
  SearchPluginProps,
} from "./types/search";
import { CalendarPlugin, DataSourcePlugin, EventLike, ExportPlugin, ThemePlugin, ViewPlugin } from "./types/plugins";
import { ToastProvider } from "./Components/Toast/Toast";
import Calendar from "./View/Calendar";
import { ensureDate } from "./Utils/DateTrannforms";

const WrappedCalendar = React.forwardRef<HTMLDivElement, CalendarProps>((props, ref) => {
  return (
    <ToastProvider>
      <Calendar {...props} ref={ref} />
    </ToastProvider>
  );
});
WrappedCalendar.displayName = 'WrappedCalendar';

export { WrappedCalendar as Calendar };
export {ensureDate}
export type {
  CalendarProps,
  EventProps,
  EventLike,
  NotificationServiceConfig,
  EmailAdapter,
  CalendarPlugin,
  DataSourcePlugin,
  DataSourceConfigProps,
  FilterPluginProps,
  SearchPluginProps,
  ThemePlugin,
  ExportPlugin,
  Resource,
  ViewPlugin,
};