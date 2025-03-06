import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DayView from './DayView';
import { TZDate } from '@date-fns/tz';

// Instead of using a locally defined simulatedDragEndEvent,
// we will use a global property. In tests, set it as:
// (globalThis as any).simulatedDragEndEvent = { ... } 

// --- Mock DndContext and useDroppable from @dnd-kit/core ---
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

// --- Mock the TimeSlot component ---
jest.mock('./TimeSlot', () => ({
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
  };

  // Dummy events: one normal event, one recurring event, one multi-day event.
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

  // Base props for DayView:
  const baseProps = {
    events: dummyEvents,
    onEventUpdate: jest.fn(),
    onEventClick: jest.fn(),
    onSlotClick: jest.fn(),
    currentDate: new Date('2023-01-01T00:00:00Z'),
    slotMin: "8", // parsed to number 8
    slotMax: "10", // parsed to number 10 => numberOfSlots = ((10-8)*60)/30 = 4 slots
    config: dummyConfig,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders error message when numberOfSlots is invalid', () => {
    // Use slotMin and slotMax that produce 0 slots (e.g., "10" and "10")
    const props = { ...baseProps, slotMin: "10", slotMax: "10" };
    render(<DayView {...props} />);
    expect(screen.getByText(/de tempo inválido/i)).toBeInTheDocument();
  });

  test('renders correct number of TimeSlot components', () => {
    render(<DayView {...baseProps} />);
    const timeSlots = screen.getAllByTestId('time-slot');
    expect(timeSlots.length).toBe(4);
  });

  test('renders red line overlay if current date is today', () => {
    // Set currentDate to today so that isToday is true
    const today = new Date();
    const props = { ...baseProps, currentDate: today };
    render(<DayView {...props} />);
    // The red line overlay is rendered as a div with inline style "borderTop: 2px dashed red"
    const redLine = screen.getByText((content, element) => {
      return element?.style.borderTop === "2px dashed red";
    });
    expect(redLine).toBeInTheDocument();
  });

  test('drag end event with small delta.y (<1) triggers onEventClick', async () => {
    // Use a dummy event with id '1'
    const props = { ...baseProps };
    props.events = [
      {
        id: '1',
        title: 'Event 1',
        start: '2023-01-01T08:00:00Z',
        end: '2023-01-01T09:00:00Z',
      },
    ];
    const onEventClickMock = jest.fn();
    props.onEventClick = onEventClickMock;
    props.onEventUpdate = jest.fn();

    render(<DayView {...props} />);
    // Simulate drag end with delta.y < 1 (e.g., 0.5)
    (globalThis as any).simulatedDragEndEvent = {
      active: { id: '1' },
      over: { id: '2023-01-01T08:30:00.000Z' },
      delta: { y: 0.5, x: 0 },
    };
    fireEvent.click(screen.getByTestId('simulate-drag-end'));
    await waitFor(() => {
      expect(onEventClickMock).toHaveBeenCalled();
    });
  });

  test('drag end event with delta.y >= 1 triggers onEventUpdate', async () => {
    const props = { ...baseProps };
    props.events = [
      {
        id: '1',
        title: 'Event 1',
        start: '2023-01-01T08:00:00Z',
        end: '2023-01-01T09:00:00Z',
      },
    ];
    const onEventUpdateMock = jest.fn();
    props.onEventUpdate = onEventUpdateMock;
    props.onEventClick = jest.fn();
  
    render(<DayView {...props} />);
    // Simulate drag end with delta.y = 20
    (globalThis as any).simulatedDragEndEvent = {
      active: { id: '1' },
      over: { id: '2023-01-01T08:30:00.000Z' },
      delta: { y: 20, x: 0 },
    };
    fireEvent.click(screen.getByTestId('simulate-drag-end'));
    await waitFor(() => {
      expect(onEventUpdateMock).toHaveBeenCalled();
      const updatedEvent = onEventUpdateMock.mock.calls[0][0];
      // Compare timestamps instead of raw strings:
      expect(new Date(updatedEvent.start).getTime()).toBe(new Date("2023-01-01T08:30:00.000Z").getTime());
      expect(new Date(updatedEvent.end).getTime()).toBe(new Date("2023-01-01T09:30:00.000Z").getTime());
    });
  });
  
});
