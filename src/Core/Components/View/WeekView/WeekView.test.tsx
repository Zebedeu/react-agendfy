// WeekView.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import WeekView from './WeekView';
import { format, startOfWeek } from 'date-fns';
import { TZDate } from '@date-fns/tz';

// Mock do componente DayColumn
jest.mock('./DayColumn', () => {
  const React = require('react');
  const { format } = require('date-fns');
  return {
    // Importante: como o WeekView importa { DayColumn }, precisamos exportá-lo com esse nome
    DayColumn: ({ dayDate }: { dayDate: Date }) => (
      <div data-testid="day-column">Day: {format(dayDate, 'yyyy-MM-dd')}</div>
    ),
  };
});

// Configuração dummy para os testes
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
    end: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(), // +1 hora
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
    // Verifica se o texto da área all-day é renderizado
    expect(screen.getByText(dummyConfig.all_day)).toBeInTheDocument();
    // Verifica se um rótulo de horário, como "00:00", é renderizado
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });

  test("renderiza 7 colunas de dias", () => {
    render(<WeekView {...dummyProps} />);
    // Verifica se existem 7 colunas (mockadas via DayColumn)
    const dayColumns = screen.getAllByTestId("day-column");
    expect(dayColumns.length).toBe(7);

    // Opcional: verifica se o primeiro dia é o início da semana
    const currentWeekStart = startOfWeek(new TZDate(dummyProps.currentDate, dummyConfig.timeZone), { weekStartsOn: 0 });
    expect(dayColumns[0]).toHaveTextContent(format(currentWeekStart, "yyyy-MM-dd"));
  });

  test("deve processar e renderizar eventos corretamente (exceto all-day ou multi-day)", () => {
    render(<WeekView {...dummyProps} />);
    // Neste teste, garantimos que as colunas (DayColumn) estão renderizadas,
    // pois a lógica interna de eventos é encaminhada para o componente DayColumn.
    const dayColumns = screen.getAllByTestId("day-column");
    expect(dayColumns.length).toBe(7);
  });
});
