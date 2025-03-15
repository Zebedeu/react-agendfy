import "./index.css";
import React from "react";
import Calendar from "./Core/Calendar";
import { ToastProvider } from "./Core/Components/Toast/Toast";
import {
  CalendarProps,
  EventProps,
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

const WrappedCalendar: React.FC<CalendarProps> = (props) => {
  return (
    <ToastProvider>
      <Calendar {...props} />
    </ToastProvider>
  );
};

export { WrappedCalendar as Calendar };
export type {
  CalendarProps,
  EventProps,
  NotificationServiceConfig,
  EmailAdapter,
  CalendarPlugin,
  DataSourcePlugin,
  DataSourceConfigProps,
  FilterPluginProps,
  SearchPluginProps
};