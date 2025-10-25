import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DayView from './DayView';

jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd: (e: any) => void }) => (
    <div data-testid="dnd-context">
      <button
        data-testid="simulate-drag-end"
        onClick={() => onDragEnd(globalThis.simulatedDragEndEvent)}
      >
        Simulate Drag End
      </button>
      {children}
    </div>
  ),
  useDroppable: jest.fn(() => ({ setNodeRef: jest.fn(), isOver: false })),
}));


jest.mock('./Components/TimeSlot.tsx', () => ({
  TimeSlot: ({ index, slotEvents }: { index: number; slotEvents: any[] }) => (
    <div data-testid="time-slot" data-index={index}>
      TimeSlot {index} - {JSON.stringify(slotEvents)}
    </div>
  ),
}));

describe('DayView Component', () => {
  const dummyConfig = {
    timeZone: 'UTC',
    slotDuration: 30,
    slotMin: "08:00", 
    slotMax: "10:00", 
    timeZone: 'UTC',
  };

  const dummyEvents = [
    {
      id: '1',
      title: 'Event 1',
      start: '2023-01-01T08:00:00Z',
      end: '2023-01-01T09:00:00Z',
    },
    {
      id: '2',
      title: 'Recurring Event',
      start: '2023-01-01T10:00:00Z',
      end: '2023-01-01T11:00:00Z',
      recurrence: 'FREQ=DAILY;COUNT=5',
    },
    {
      id: '3',
      title: 'Multi-day Event',
      start: '2023-01-01T12:00:00Z',
      end: '2023-01-02T12:00:00Z',
      isMultiDay: true,
    },
  ];

  const baseProps = {
    events: dummyEvents,
    onEventUpdate: jest.fn(),
    onEventClick: jest.fn(),
    onSlotClick: jest.fn(),
    currentDate: new Date('2023-01-01T00:00:00Z'),
    config: dummyConfig,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders error message when numberOfSlots is invalid', () => {
    const props = { ...baseProps, config: { ...baseProps.config, slotMin: "10", slotMax: "10" } };
    render(<DayView {...props} />);
    expect(screen.getByText(/invalid time slot/i)).toBeInTheDocument();
  });

  test('renders correct number of TimeSlot components', () => {
    render(<DayView {...baseProps} />);
    const timeSlots = screen.getAllByTestId('time-slot');
    expect(timeSlots.length).toBe(4);
  });

  test('renders red line overlay if current date is today', () => {
    const today = new Date();
    const props = { ...baseProps, currentDate: today };
    render(<DayView {...props} />);
    const redLine = screen.getByText((content, element) => {
      return element?.style.borderTop === "2px dashed red";
    });
    expect(redLine).toBeInTheDocument();
  });
});
