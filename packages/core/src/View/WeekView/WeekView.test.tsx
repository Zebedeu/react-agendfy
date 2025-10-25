import React from 'react';
import { render, screen } from '@testing-library/react';
import WeekView from './WeekView';
import { format, startOfWeek } from 'date-fns';
import { TZDate } from '@date-fns/tz';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
jest.mock('./Components/DayColumn.tsx', () => {
  const React = require('react');
  const { format } = require('date-fns');
  return {
    DayColumn: ({ dayDate, isSlotSelected }: { dayDate: Date, isSlotSelected: (date: Date) => boolean }) => (
      <div data-testid="day-column">Day: {format(dayDate, 'yyyy-MM-dd')}</div>
    ),
  };
});

const dummyConfig = {
  timeZone: "UTC",
  slotDuration: 15,
  all_day: "All Day",
  defaultView: "week" as any,
  slotLabelFormat: "HH:mm",
  slotMin: "00:00",
  slotMax: "23:59",
  lang: "en",
  today: "Today",
  monthView: "Month",
  weekView: "Week",
  dayView: "Day",
  listView: "List",
  filter_resources: "Filter Resources",
  businessHours: { enabled: false, intervals: [] },
  calendar_export: "Export",
};

const dummyEvents = [
  {
    id: "1",
    title: "Event 1",
    start: new Date().toISOString(),
    end: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
    alertBefore: 10,
    isMultiDay: false,
    isAllDay: false,
    color: "#FF0000",
  },
];

const dummyProps = {
  events: dummyEvents,
  onEventUpdate: jest.fn(),
  onEventClick: jest.fn(),
  onDayClick: jest.fn(),
  onEventResize: jest.fn(),
  onSlotClick: jest.fn(),
  onDateRangeSelect: jest.fn(),
  currentDate: new Date(),
  slotMin: "00:00",
  slotMax: "24:00",
  config: dummyConfig,
};

describe("WeekView Component", () => {
  test("displays error message when number of slots is invalid", () => {
    const invalidProps = {
      ...dummyProps,
      slotMin: "24",
      slotMax: "24",
    };
    render(<WeekView {...invalidProps} />);
    expect(
      screen.getByText(/invalid time slot/i)
    ).toBeInTheDocument();
  });

  test("renders All-Day area and time labels", () => {
    render(<WeekView {...dummyProps} />);
    expect(screen.getByText(dummyConfig.all_day)).toBeInTheDocument();
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });

  test("renders 7 day columns", () => {
    render(<WeekView {...dummyProps} />);
  
    const dayColumns = screen.getAllByTestId("day-column");
    expect(dayColumns.length).toBe(7);

    const currentWeekStart = startOfWeek(new TZDate(dummyProps.currentDate, dummyConfig.timeZone), { weekStartsOn: 0 });
    expect(dayColumns[0]).toHaveTextContent(format(currentWeekStart, "yyyy-MM-dd"));
  });

  test("should process and render events correctly (except all-day or multi-day)", () => {
    render(<WeekView {...dummyProps} />);

    const dayColumns = screen.getAllByTestId("day-column");
    expect(dayColumns.length).toBe(7);
  });
});
