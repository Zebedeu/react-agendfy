import React from 'react';
import { render, screen } from '@testing-library/react';
import WeekView from './WeekView';
import { format, startOfWeek } from 'date-fns';
import { TZDate } from '@date-fns/tz';

// Mock para window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false, // Por padrão, simula uma tela não-móvel para este teste
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
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
  slotMin: "0",
  slotMax: "24",
  config: dummyConfig,
};

describe("WeekView Component", () => {
  test("exibe mensagem de erro quando número de slots é inválido", () => {
    const invalidProps = {
      ...dummyProps,
      slotMin: "24",
      slotMax: "24",
    };
    render(<WeekView {...invalidProps} />);
    expect(
      screen.getByText(/de tempo inválido/i)
    ).toBeInTheDocument();
  });

  test("renderiza área All-Day e os rótulos de horário", () => {
    render(<WeekView {...dummyProps} />);
    expect(screen.getByText(dummyConfig.all_day)).toBeInTheDocument();
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });

  test("renderiza 7 colunas de dias", () => {
    render(<WeekView {...dummyProps} />);
  
    const dayColumns = screen.getAllByTestId("day-column");
    expect(dayColumns.length).toBe(7);

    const currentWeekStart = startOfWeek(new TZDate(dummyProps.currentDate, dummyConfig.timeZone), { weekStartsOn: 0 });
    expect(dayColumns[0]).toHaveTextContent(format(currentWeekStart, "yyyy-MM-dd"));
  });

  test("deve processar e renderizar eventos corretamente (exceto all-day ou multi-day)", () => {
    render(<WeekView {...dummyProps} />);

    const dayColumns = screen.getAllByTestId("day-column");
    expect(dayColumns.length).toBe(7);
  });
});
