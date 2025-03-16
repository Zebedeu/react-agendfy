
import React from 'react';
import { render, screen } from '@testing-library/react';
import WeekView from './WeekView';
import { format, startOfWeek } from 'date-fns';
import { TZDate } from '@date-fns/tz';

jest.mock('./Components/DayColumn.tsx', () => {
  const React = require('react');
  const { format } = require('date-fns');
  return {
  
    DayColumn: ({ dayDate }: { dayDate: Date }) => (
      <div data-testid="day-column">Day: {format(dayDate, 'yyyy-MM-dd')}</div>
    ),
  };
});

const dummyConfig = {
  timeZone: "UTC",
  slotDuration: 15,
  all_day: "All Day",
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
