import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeekEvent } from './WeekEvent';
import { TZDate } from '@date-fns/tz';
import { addMinutes, addDays, subDays } from 'date-fns';

jest.mock("re-resizable", () => {
  return {
    Resizable: ({ children, onResizeStop, ...props }: any) => {
      return (
        <div data-testid="resizable" {...props}>
          {children}
          <button
            data-testid="simulate-bottom"
            onClick={() =>
              onResizeStop(
                {},
                "bottom",
                { style: { height: "120px" } },
                { height: 40, width: 0 }
              )
            }
          >
            Simulate Bottom
          </button>
          <button
            data-testid="simulate-bottom-multiday"
            onClick={() =>
              onResizeStop(
                {},
                "bottom",
                { style: { height: "2133px" } },
                { height: 2133, width: 0 }
              )
            }
          >
            Simulate Bottom MultiDay
          </button>
          <button
            data-testid="simulate-right"
            onClick={() =>
              onResizeStop(
                {},
                "right",
                { style: {} },
                { height: 0, width: 150 }
              )
            }
          >
            Simulate Right
          </button>
          <button
            data-testid="simulate-left"
            onClick={() =>
              onResizeStop(
                {},
                "left",
                { style: {} },
                { height: 0, width: 150 }
              )
            }
          >
            Simulate Left
          </button>
        </div>
      );
    },
  };
});

jest.mock("@dnd-kit/core", () => ({
  useDraggable: jest.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    isDragging: false,
  })),
}));

jest.mock("../../../Components/BaseEvent.tsx", () => {
  return (props: any) => <div data-testid="base-event">{props.event.title}</div>;
});

describe("WeekEvent Component", () => {

  const dummyEvent = {
    id: "1",
    title: "Test Event",
    start: "2023-01-01T10:00:00Z",
    end: "2023-01-01T11:00:00Z",
    color: "#000000",
    isAllDay: false,
    isMultiDay: false,
  };

  const dummyConfig = {
    timeZone: "UTC",
    defaultView: "week" as const,
    slotDuration: 15,
    slotLabelFormat: "HH:mm",
    slotMin: "00:00",
    slotMax: "23:59",
    lang: "en",
    today: "Today",
    monthView: "Month",
    weekView: "Week",
    dayView: "Day",
    listView: "List",
    all_day: "All Day",
    filter_resources: "Filter Resources",
    businessHours: {
      enabled: false,
      intervals: [],
    },
    calendar_export: "Export",
  };

  const dummyProps = {
    event: dummyEvent,
    onEventClick: jest.fn(),
    positionStyle: { top: "100px", left: "50px", height: "80px", width: "100px" },
    onEventResize: jest.fn(),
    config: dummyConfig,
    isMultiDay: false,
    isStart: true,
    isEnd: true,
    dayDate: new Date("2023-01-01T00:00:00Z"),
    isDraggable: true,
    endHour: 24,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders WeekEvent and displays BaseEvent", () => {
    render(<WeekEvent {...dummyProps} />);
    expect(screen.getByTestId("base-event")).toBeInTheDocument();
    expect(screen.getByTestId("base-event")).toHaveTextContent("Test Event");
  });

  test("simulate bottom resize updates event end time normally", () => {
    render(<WeekEvent {...dummyProps} />);
    const simulateBottomButton = screen.getByTestId("simulate-bottom");
    fireEvent.click(simulateBottomButton);

    const expectedNewEnd = addMinutes(new Date(dummyEvent.end), 15).toISOString();
    expect(dummyProps.onEventResize).toHaveBeenCalledWith({
      ...dummyEvent,
      end: expectedNewEnd,
    });
  });

  test("simulate bottom resize triggers multi-day update when exceeding maxEndTime", () => {
    render(<WeekEvent {...dummyProps} />);
    const simulateBottomMultiDayButton = screen.getByTestId("simulate-bottom-multiday");
    fireEvent.click(simulateBottomMultiDayButton);

    const additionalMinutes = Math.round((2133 / 40) * dummyConfig.slotDuration);
    const originalEventEnd = new Date(dummyEvent.end);
    let newEndTime = addMinutes(originalEventEnd, additionalMinutes);
  
    const dayDate = dummyProps.dayDate;
    const dayEndTime = new Date(dayDate);
    dayEndTime.setUTCHours(24, 0, 0, 0);
    if (newEndTime > dayEndTime) {
      const overflowMinutes = (newEndTime.getTime() - dayEndTime.getTime()) / (1000 * 60);
      const nextDayStartTime = new Date(dayDate);
      nextDayStartTime.setUTCHours(0, 0, 0, 0);
      nextDayStartTime.setUTCDate(nextDayStartTime.getUTCDate() + 1);
      newEndTime = addMinutes(nextDayStartTime, overflowMinutes);
    }

    expect(dummyProps.onEventResize).toHaveBeenCalledWith({
      ...dummyEvent,
      end: newEndTime,
      isMultiDay: true,
    });
  });

  test("simulate right resize updates event end date by adding days", () => {
    render(<WeekEvent {...dummyProps} />);
    const simulateRightButton = screen.getByTestId("simulate-right");
    fireEvent.click(simulateRightButton);

    const expectedNewEnd = addDays(new Date(dummyEvent.end), 2).toISOString();
    expect(dummyProps.onEventResize).toHaveBeenCalledWith({
      ...dummyEvent,
      end: expectedNewEnd,
    });
  });

  test("simulate left resize updates event start date by subtracting days", () => {
    render(<WeekEvent {...dummyProps} />);
    const simulateLeftButton = screen.getByTestId("simulate-left");
    fireEvent.click(simulateLeftButton);

    const expectedNewStart = subDays(new Date(dummyEvent.start), 2).toISOString();;
    expect(dummyProps.onEventResize).toHaveBeenCalledWith({
      ...dummyEvent,
      start: expectedNewStart,
    });
  });
});
