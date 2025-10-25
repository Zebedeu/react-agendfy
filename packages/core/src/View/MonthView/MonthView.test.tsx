import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { addDays, format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import MonthView from './MonthView';

const mockDndContextOnDragEnd = jest.fn();
jest.mock('@dnd-kit/core', () => {
  const originalModule = jest.requireActual('@dnd-kit/core');
  return {
    ...originalModule,
    DndContext: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd: (event: any) => void }) => {
      if (onDragEnd) {
        mockDndContextOnDragEnd.mockImplementation(onDragEnd);
      }
      return <div data-testid="dnd-context">{children}</div>;
    },
  };
});
const slotDuration = 30;
const localeTest = { slotDuration, ...enUS };

const currentDate = new Date('2023-01-15T00:00:00.000Z');

const testEvents = [
  {
    id: '1',
    title: 'Event 1',
    start: '2023-01-15T09:00:00',
    end: '2023-01-15T10:00:00',
    color: '#FF0000',
    resourceIds: ['r1'],
  },
  {
    id: '2',
    title: 'Event 2',
    start: '2023-01-15T11:00:00',
    end: '2023-01-15T12:00:00',
    color: '#00FF00',
  },
  {
    id: '3',
    title: 'Event 3',
    start: '2023-01-15T13:00:00',
    end: '2023-01-15T14:00:00',
    color: '#0000FF',
  },
  {
    id: '4',
    title: 'Event 4',
    start: '2023-01-15T15:00:00',
    end: '2023-01-15T16:00:00',
    color: '#FFFF00',
  },
];

const testResources = [{ id: 'r1', name: 'Resource 1' }];

jest.mock('./../../Components/Resource/ResourceView.tsx', () => () => (
  <div data-testid="resource-view">ResourceView</div>
));

jest.mock('./../../Utils/DateTrannforms', () => ({
  ensureDate: (date: any) => new Date(date),
  expandRecurringEvents: (events: any) => events,
}));

describe('MonthView Component', () => {
  it('should render the header with the days of the week', () => {
    render(
      <MonthView
        events={[]}
        currentDate={currentDate}
        config={localeTest}
      />
    );
    const headerCells = screen.getAllByText(/^[A-Za-z]{2,}$/);
    expect(headerCells.length).toBeGreaterThanOrEqual(7);
  });

  it('should render the day grid with cells containing day numbers', () => {
    render(
      <MonthView
        events={[]}
        currentDate={currentDate}
        config={localeTest}
      />
    );
    const dayCell = screen.getByText('15');
    expect(dayCell).toBeInTheDocument();
  });

  it('should call onDayClick when clicking on a day cell', () => {
    const onDayClickMock = jest.fn();
    render(
      <MonthView
        events={[]}
        currentDate={currentDate}
        config={localeTest}
        onDayClick={onDayClickMock}
      />
    );
    const dayCell = screen.getByText('15');
    fireEvent.click(dayCell);
    expect(onDayClickMock).toHaveBeenCalled();
    const clickedDate = onDayClickMock.mock.calls[0][0];
    expect(format(clickedDate, 'd')).toBe('15');
  });

  it('should call onEventClick when clicking on an event', () => {
    const onEventClickMock = jest.fn();
    render(
      <MonthView
        events={testEvents}
        currentDate={currentDate}
        locale={localeTest}
        onEventClick={onEventClickMock}
      />
    );
    const eventItem = screen.getByText('Event 1');
    fireEvent.click(eventItem);
    expect(onEventClickMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        title: 'Event 1',
        start: '2023-01-15T09:00:00',
        end: '2023-01-15T10:00:00',
      })
    );
  });

  it('should display hidden events counter if there are more than 3 events in a day and trigger alert on click', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(
      <MonthView
        events={testEvents}
        currentDate={currentDate}
        config={localeTest}
        onEventClick={() => {}}
      />
    );
    const hiddenCount = screen.getByText('+1');
    expect(hiddenCount).toBeInTheDocument();
    fireEvent.click(hiddenCount);
    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('should render ResourceView when showResourceView is true and resources are provided', () => {
    render(
      <MonthView
        events={[]}
        currentDate={currentDate}
        config={localeTest}
        resources={testResources}
        showResourceView={true}
      />
    );
    const resourceView = screen.getByTestId('resource-view');
    expect(resourceView).toBeInTheDocument();
  });

  it('should call onEventUpdate when a drag event is simulated', async () => {
    const onEventUpdateMock = jest.fn();
    render(
      <MonthView
        events={testEvents}
        currentDate={currentDate}
        config={localeTest}
        onEventUpdate={onEventUpdateMock}
      />
    );

    const active = {
      id: '1',
      data: { current: { event: testEvents[0] } },
    };
    const over = {
      id: '2023-01-20T00:00:00.000Z',
    };

    mockDndContextOnDragEnd({ active, over });

    await waitFor(() => {
      expect(onEventUpdateMock).toHaveBeenCalled();
    });

    const updatedEvent = onEventUpdateMock.mock.calls[0][0];
    expect(format(new Date(updatedEvent.start), 'yyyy-MM-dd')).toBe('2023-01-20');
    expect(format(new Date(updatedEvent.start), 'HH:mm:ss')).toBe('09:00:00');
  });
});
