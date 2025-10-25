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
  DataSourcePlugin,
  DataSourceConfigProps,
} from "./types/dataSource";
import {
  FilterPluginProps,
  SearchPluginProps,
} from "./types/search";
import { CalendarPlugin } from "./types/plugns";
import { ToastProvider } from "./Components/Toast/Toast";
import Calendar from "./View/Calendar";
import { ensureDate } from "./Utils/DateTrannforms";

const WrappedCalendar: React.FC<CalendarProps> = (props) => {
  return (
    <ToastProvider>
      <Calendar {...props} />
    </ToastProvider>
  );
};

export { WrappedCalendar as Calendar };
export {ensureDate}
export type {
  CalendarProps,
  EventProps,
  NotificationServiceConfig,
  EmailAdapter,
  CalendarPlugin,
  DataSourcePlugin,
  DataSourceConfigProps,
  FilterPluginProps,
  SearchPluginProps,
  Resource,
};