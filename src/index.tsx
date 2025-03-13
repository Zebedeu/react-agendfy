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
export type { CalendarProps, EmailAdapter } from "./types";
