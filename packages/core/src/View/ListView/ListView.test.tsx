import React from 'react';
import { render, screen, fireEvent } from "@testing-library/react";
import ListView from "./ListView";
import { Config, EventProps } from "../../types";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {
      // do nothing
    }
    unobserve() {
      // do nothing
    }
    disconnect() {
      // do nothing
    }
  };
});

describe("ListView Component", () => {
  const mockEvents: EventProps[] = [
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
    lang: 'en',
    today: 'Today',
    monthView: 'Month',
    weekView: 'Week',
    dayView: 'Day',
    listView: 'List',
    all_day: 'All day',
    clear_filter: 'Clear Filters',
    filter_resources: 'Filter',
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

  test("should render events grouped by day", () => {
    render(<ListView events={mockEvents} currentDate={new Date("2023-01-01")} />);

    expect(screen.getByText("Sunday, 15 January")).toBeInTheDocument();
    expect(screen.getByText("Monday, 16 January")).toBeInTheDocument();
    expect(screen.getByText("Event 1")).toBeInTheDocument();
    expect(screen.getByText("Event 2")).toBeInTheDocument();
  });

  test("should display a message when there are no events", () => {
    render(<ListView events={[]} currentDate={new Date("2023-01-01")} />);

    expect(
      screen.getByText("There are no events for this period.")
    ).toBeInTheDocument();
  });

  test("should call onEventClick when an event is clicked", () => {
    const onEventClickMock = jest.fn();
    render(
      <ListView events={mockEvents} onEventClick={onEventClickMock} currentDate={new Date("2023-01-01")} />
    );

    const eventItem = screen.getByText("Event 1");
    fireEvent.click(eventItem);

    expect(onEventClickMock).toHaveBeenCalledWith(mockEvents[0]);
  });
});
