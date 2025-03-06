import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ListView from "./ListView";
import { Config, EventProps } from "../../../../types";

describe("ListView Component", () => {
  const mockEvents: EventProps = [
    {
      id: "1",
      title: "Event 1",
      start: "2023-01-15T09:00:00",
      end: "2023-01-15T10:00:00",
      color: "#ff0000",
      isAllDay: true,
      isMultiDay: true,
      resources: [{ name: "Resource 1" }],
    },
    {
      id: "2",
      title: "Event 2",
      start: "2023-01-16T14:00:00",
      end: "2023-01-16T16:00:00",
      isAllDay: true,
      isMultiDay: true,
      color: "#00ff00",
    },
  ];

  const defaultConfig: Config = {
    timeZone: 'UTC',
    defaultView: 'week',
    slotDuration: 60,
    slotLabelFormat: 'HH:mm',
    slotMin: '00:00',
    slotMax: '23:59',
    lang: 'pt',
    today: 'Hoje',
    monthView: 'Mês',
    weekView: 'Semana',
    dayView: 'Dia',
    listView: 'Lista',
    all_day: 'Todo o dia',
    clier_filter: 'Limpar Filtros',
    filter_resources: 'Filtrar',
    businessHours: {
      enabled: true,
      intervals: [
        { daysOfWeek: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "17:00" }
      ]
    },
    
    alerts: {
      enabled: false,          
      thresholdMinutes: 15,  
    }, 
   };

  test("deve renderizar eventos agrupados por dia", () => {
    render(<ListView events={mockEvents} currentDate={new Date("2023-01-01")} />);

    expect(screen.getByText("Sunday, 15 January")).toBeInTheDocument();
    expect(screen.getByText("Monday, 16 January")).toBeInTheDocument();
    expect(screen.getByText("Event 1")).toBeInTheDocument();
    expect(screen.getByText("Event 2")).toBeInTheDocument();
  });

  test("deve exibir uma mensagem quando não há eventos", () => {
    render(<ListView events={[]} currentDate={new Date("2023-01-01")} />);

    expect(
      screen.getByText("There are no events for this period.")
    ).toBeInTheDocument();
  });

  test("deve chamar onEventClick ao clicar em um evento", () => {
    const onEventClickMock = jest.fn();
    render(
      <ListView events={mockEvents} onEventClick={onEventClickMock} currentDate={new Date("2023-01-01")} />
    );

    const eventItem = screen.getByText("Event 1");
    fireEvent.click(eventItem);

    expect(onEventClickMock).toHaveBeenCalledWith(mockEvents[0]);
  });
});
