// WeekEvent.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeekEvent } from './WeekEvent';
import { TZDate } from '@date-fns/tz';
import { addMinutes, addDays, subDays } from 'date-fns';

// Mock the Resizable component from "re-resizable"
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

// Mock useDraggable from @dnd-kit/core
jest.mock("@dnd-kit/core", () => ({
  useDraggable: jest.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    isDragging: false,
  })),
}));

// Mock BaseEvent so we can verify its rendering
jest.mock("../../BaseEvent", () => {
  return (props: any) => <div data-testid="base-event">{props.event.title}</div>;
});

describe("WeekEvent Component", () => {
  // Dummy event and configuration
  const dummyEvent = {
    id: "1",
    title: "Test Event",
    start: "2023-01-01T10:00:00Z",
    end: "2023-01-01T11:00:00Z",
  };

  const dummyConfig = {
    timeZone: "UTC",
    slotDuration: 15,
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

    // For bottom resize, delta.height = 40; additionalMinutes = Math.round((40/40)*15) = 15 minutes.
    const expectedNewEnd = addMinutes(new Date(dummyEvent.end), 15);
    expect(dummyProps.onEventResize).toHaveBeenCalledWith({
      ...dummyEvent,
      end: expectedNewEnd,
    });
  });

  test("simulate bottom resize triggers multi-day update when exceeding maxEndTime", () => {
    render(<WeekEvent {...dummyProps} />);
    const simulateBottomMultiDayButton = screen.getByTestId("simulate-bottom-multiday");
    fireEvent.click(simulateBottomMultiDayButton);

    // For bottom resize multi-day simulation, delta.height = 2133.
    const additionalMinutes = Math.round((2133 / 40) * dummyConfig.slotDuration);
    const originalEventEnd = new Date(dummyEvent.end);
    let newEndTime = addMinutes(originalEventEnd, additionalMinutes);

    // maxEndTime for non-multi-day: setHours(startOfDay(dayDate), endHour)
    // For dayDate = 2023-01-01T00:00:00Z and endHour = 24, maxEndTime is 2023-01-02T00:00:00Z.
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

    // For right resize, delta.width = 150, daysAdded = Math.round(150/100) = 2.
    const expectedNewEnd = addDays(new Date(dummyEvent.end), 2);
    expect(dummyProps.onEventResize).toHaveBeenCalledWith({
      ...dummyEvent,
      end: expectedNewEnd,
    });
  });

  test("simulate left resize updates event start date by subtracting days", () => {
    render(<WeekEvent {...dummyProps} />);
    const simulateLeftButton = screen.getByTestId("simulate-left");
    fireEvent.click(simulateLeftButton);

    // For left resize, delta.width = 150, daysRemoved = Math.round(150/100) = 2.
    const expectedNewStart = subDays(new Date(dummyEvent.start), 2);
    expect(dummyProps.onEventResize).toHaveBeenCalledWith({
      ...dummyEvent,
      start: expectedNewStart,
    });
  });
});
