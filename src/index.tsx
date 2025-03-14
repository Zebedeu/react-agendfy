import "./index.css";
import React from "react";
import Calendar from "./Core/Calendar";
import { CalendarProps } from "./types";
import { ToastProvider } from "./Core/Components/Toast/Toast";


const WrappedCalendar: React.FC<CalendarProps> = (props) => {
  return (
    <ToastProvider>
      <Calendar {...props} />
    </ToastProvider>
  );
};

export { WrappedCalendar as Calendar };
export type { CalendarProps, EventProps} from "./types";
export type { NotificationServiceConfig, EmailAdapter} from "./types/Notification";
export type { CalendarPlugin} from "./types/plugns";
export type { DataSourcePlugin, DataSourceConfigProps } from "./types/DataSource";
export type { FilterPluginProps, SearchPluginProps } from "./types/Search";
