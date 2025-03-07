// WeekTimeSlot.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeekTimeSlot } from './WeekTimeSlot';
import { TZDate } from '@date-fns/tz';

// Mock the useDroppable hook from @dnd-kit/core

jest.mock('@date-fns/tz', () => {
  const originalModule = jest.requireActual('@date-fns/tz');
  return {
    ...originalModule,
    TZDate: originalModule.TZDate, // Or mock implementation if needed for specific timezone tests
  };
});

jest.mock('@dnd-kit/core', () => ({
  useDroppable: jest.fn(() => ({
    setNodeRef: jest.fn(),
    isOver: false,
  })),
}));

// Mock the WeekEvent component
jest.mock('./WeekEvent', () => ({
  WeekEvent: ({ event, positionStyle }: any) => (
    <div data-testid="week-event">
      {event.title} - {positionStyle.height}
    </div>
  ),
}));

// Dummy configuration and props for testing
const dummyConfig = {
  timeZone: "UTC",
  slotDuration: 15,
  all_day: "All Day",
};

const dummyDayDate = new Date(2023, 0, 1); // January 1, 2023
const dummySlotMin = "0";

describe('WeekTimeSlot Component', () => {
  test('renders without events', () => {
    const { container } = render(
      <WeekTimeSlot
        index={0}
        dayDate={dummyDayDate}
        slotEvents={[]}
        onEventClick={jest.fn()}
        onSlotClick={jest.fn()}
        onEventResize={jest.fn()}
        parsedSlotMax="24"
        slotMin={dummySlotMin}
        config={dummyConfig}
        isDraggable={true}
      />
    );
    // The main container div should be rendered
    const mainDiv = container.firstChild;
    expect(mainDiv).toBeInTheDocument();
  });

  test('calls onSlotClick when the slot is clicked', () => {
    const onSlotClickMock = jest.fn();
    const { container } = render(
      <WeekTimeSlot
        index={0}
        dayDate={dummyDayDate}
        slotEvents={[]}
        onEventClick={jest.fn()}
        onSlotClick={onSlotClickMock}
        onEventResize={jest.fn()}
        parsedSlotMax="24"
        slotMin={dummySlotMin}
        config={dummyConfig}
        isDraggable={true}
      />
    );
    // Simulate clicking on the main slot div
    const mainDiv = container.firstChild;
    expect(mainDiv).toBeInTheDocument();
    if (mainDiv) {
      fireEvent.click(mainDiv);
    }
    expect(onSlotClickMock).toHaveBeenCalled();
    // Check that the callback is called with a TZDate instance
    const callbackArg = onSlotClickMock.mock.calls[0][0];
    expect(callbackArg).toBeInstanceOf(TZDate);
  });

  test('renders a WeekEvent for each event in slotEvents with correct height', () => {
    // Create a dummy event with a 30-minute duration.
    // Given slotDuration is 15 minutes, the height should be calculated as (30/15)*40 = 80px.
    const dummyEvent = {
      id: "1",
      title: "Test Event",
      start: "2023-01-01T00:00:00Z",
      end: "2023-01-01T00:30:00Z",
    };
    render(
      <WeekTimeSlot
        index={0}
        dayDate={dummyDayDate}
        slotEvents={[dummyEvent]}
        onEventClick={jest.fn()}
        onSlotClick={jest.fn()}
        onEventResize={jest.fn()}
        parsedSlotMax="24"
        slotMin={dummySlotMin}
        config={dummyConfig}
        isDraggable={true}
      />
    );
    const weekEvent = screen.getByTestId('week-event');
    expect(weekEvent).toHaveTextContent("Test Event - 80px");
  });

  test('applies the droppable background color when isOver is true', () => {
    // Override useDroppable to simulate that the slot is being hovered over
    const { useDroppable } = require('@dnd-kit/core');
    useDroppable.mockReturnValue({
      setNodeRef: jest.fn(),
      isOver: true,
    });
    const { container } = render(
      <WeekTimeSlot
        index={0}
        dayDate={dummyDayDate}
        slotEvents={[]}
        onEventClick={jest.fn()}
        onSlotClick={jest.fn()}
        onEventResize={jest.fn()}
        parsedSlotMax="24"
        slotMin={dummySlotMin}
        config={dummyConfig}
        isDraggable={true}
      />
    );
    const mainDiv = container.firstChild;
    expect(mainDiv?.className).toMatch(/bg-green-200/);
  });
});
