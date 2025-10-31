import './index.css';
import React from "react";
import {
  CalendarProps,
  EventProps,
  Resource,
} from "./types/types";
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
import CalendarComponent from "./View/Calendar";
import { ensureDate } from "./Utils/DateTrannforms";
import { downloadBlob } from './Utils/pluginUtils';

const WrappedCalendar = React.forwardRef<HTMLDivElement, CalendarProps>((props, ref) => {
  return (
    <ToastProvider>
      <CalendarComponent events={[]} {...props} ref={ref} />
    </ToastProvider>
  );
});
WrappedCalendar.displayName = 'WrappedCalendar';

export { WrappedCalendar as Calendar, ensureDate, downloadBlob };
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