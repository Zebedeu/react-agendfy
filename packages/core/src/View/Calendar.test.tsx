import React, { Suspense } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from './../Components/Toast/Toast'
import Calendar from '../View/Calendar';
import { act } from 'react';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

jest.mock('./DayView/DayView', () => () => (
  <div data-testid="day-view">DayView</div>
));

jest.mock('./WeekView/WeekView', () => {
  return function MockWeekView({ events, currentDate, onEventUpdate }: { 
    events: any; 
    currentDate: Date; 
    onEventUpdate: (event: any) => void;
  }) {
    return (
      <div 
        data-testid="week-view" 
        data-events={JSON.stringify(events)}
        data-current-date={currentDate.toISOString()}
      >
        WeekView 
        <button data-testid="btn-event-update" onClick={() => onEventUpdate({ id: '1', title: 'Updated Event', resourceId: 'r1' })}>
          Update Event
        </button>
      </div>
    );
  };
});

jest.mock('./MonthView/MonthView.tsx', () => () => (
  <div data-testid="month-view">MonthView</div>
));

jest.mock('./ListView/ListView', () => () => (
  <div data-testid="list-view">ListView</div>
));


jest.mock('../Utils/calendarHelpers', () => ({
  normalizeEvents: jest.fn((events) => events),
  filterEvents: jest.fn((events, filteredResources) => {
    if (!filteredResources || filteredResources.length === 0) return events;
    return events.filter((event) => filteredResources.includes(event.resourceId));
  }),
}));

jest.mock('../hooks/useCalendarNavigation', () => ({
  __esModule: true,
  default: ({ setCurrentDate, currentDate, defaultView }: any) => ({
    navigateToday: () => setCurrentDate(new Date()),
    navigateBack: () => {
      const newDate = new Date(currentDate);
      if (defaultView === 'week') newDate.setDate(newDate.getDate() - 7);
      else if (defaultView === 'month') newDate.setMonth(newDate.getMonth() - 1);
      else newDate.setDate(newDate.getDate() - 1);
      setCurrentDate(newDate);
    },
    navigateForward: () => {
      const newDate = new Date(currentDate);
      if (defaultView === 'week') newDate.setDate(newDate.getDate() + 7);
      else if (defaultView === 'month') newDate.setMonth(newDate.getMonth() + 1);
      else newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
    },
  }),
}));


describe('Calendar Component', () => {
  const events = [
    { id: '1', title: 'Event 1', resourceId: 'r1' },
    { id: '2', title: 'Event 2', resourceId: 'r2' },
    { id: '3', title: 'Event 3', resourceId: 'r1' },
  ];

  const resources = [
    { id: 'r1', name: 'Resource 1', type: 'room' },
    { id: 'r2', name: 'Resource 2', type: 'person' },
  ];

  it('should render CalendarHeader and the default view (week)', async () => {
    render(
      <ToastProvider>
    <Calendar events={events} config={{ defaultView: 'week', lang: 'en' }} />
    </ToastProvider>);
    expect(await screen.findByText('Filter Resources')).toBeInTheDocument();
    expect(await screen.findByTestId('week-view')).toBeInTheDocument();
  });

 jest.mock('../View/MonthView/MonthView', () => () => (
  <div data-testid="month-view">MonthView</div>
));

it('should switch to MonthView when the view change button is clicked', async () => {
  render(
    <ToastProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <Calendar events={[]} config={{ defaultView: 'week', lang: 'en' }} />
      </Suspense>
    </ToastProvider>
  );

  // Verifica que começa com WeekView
  expect(await screen.findByTestId('week-view')).toBeInTheDocument();

  // Clica no botão "Month"
  const viewChangeButton = await screen.findByText('Month');

  await act(async () => {
    fireEvent.click(viewChangeButton);
  });

  // Espera o novo componente aparecer
  await waitFor(() => {
    expect(screen.getByTestId('month-view')).toBeInTheDocument();
  });
});
  it('should navigate to today\'s date when the Today button is clicked', async () => {
    render(
      <ToastProvider>
      <Calendar events={events} config={{ defaultView: 'week', lang: 'en' }} />
      </ToastProvider>);
    const weekViewBefore = await screen.findByTestId('week-view');
    const previousDate = weekViewBefore.getAttribute('data-current-date');    
    fireEvent.click(screen.getByLabelText('Go to today'));
    await waitFor(() => {
      const weekViewAfter = screen.getByTestId('week-view');
      const newDate = weekViewAfter.getAttribute('data-current-date');
      expect(newDate).not.toEqual(previousDate);
    
      const now = new Date();
      const diff = Math.abs(new Date(newDate as string).getTime() - now.getTime());
      expect(diff).toBeLessThan(1000);
    });
  });

  it('should navigate back and forward when the corresponding buttons are clicked', async () => {
    render(
      <ToastProvider>
      <Calendar events={events} config={{ defaultView: 'week', lang: 'en' }} />
      </ToastProvider>);
    const weekView = await screen.findByTestId('week-view');
    const initialDate = new Date(weekView.getAttribute('data-current-date') as string);
    
  
    fireEvent.click(screen.getByLabelText('Back week'));
    await waitFor(() => {
      const weekViewAfterBack = screen.getByTestId('week-view');
      const backDate = new Date(weekViewAfterBack.getAttribute('data-current-date') as string);
    
      const expectedBackDate = new Date(initialDate.getTime() - 7 * 86400000);
      expect(Math.abs(backDate.getTime() - expectedBackDate.getTime())).toBeLessThan(2000);
    });

  
    fireEvent.click(screen.getByLabelText('Next week'));
    fireEvent.click(screen.getByLabelText('Next week'));
    await waitFor(() => {
      const weekViewAfterForward = screen.getByTestId('week-view');
      const forwardDate = new Date(weekViewAfterForward.getAttribute('data-current-date') as string);
    
      const expectedForwardDate = new Date(initialDate.getTime() - 7 * 86400000 + 14 * 86400000);
      expect(Math.abs(forwardDate.getTime() - expectedForwardDate.getTime())).toBeLessThan(2000);
    });
  });

  it('should update an event when the update button is clicked', async () => {
    const onEventUpdateMock = jest.fn();
    render(
      <ToastProvider>
      <Calendar events={events} config={{ defaultView: 'week', lang: 'en' }}  onEventUpdate={onEventUpdateMock}  />
      </ToastProvider>);    

    await waitFor(() => {
      const weekView = screen.getByTestId('week-view');
      const eventsData = JSON.parse(weekView.getAttribute('data-events') || '[]');
      expect(eventsData).toEqual(events);
    });

    fireEvent.click(screen.getByTestId('btn-event-update'));
    await waitFor(() => {
      expect(onEventUpdateMock).toHaveBeenCalledWith({ id: '1', title: 'Updated Event', resourceId: 'r1' });
    });
  
  });

  it('should apply the resource filter when the filter button is clicked', async () => {
    render(
      <ToastProvider>
        <Calendar events={events} resources={resources} config={{ defaultView: 'week', lang: 'en' }} />
      </ToastProvider>
    );

    await waitFor(() => {
      const weekView = screen.getByTestId('week-view');
      const eventsData = JSON.parse(weekView.getAttribute('data-events') || '[]');
      expect(eventsData).toEqual(events);
    });

    fireEvent.click(screen.getByText(/Filter Resources/i));
    const checkbox = await screen.findByLabelText('Resource 1');
    fireEvent.click(checkbox);

    await waitFor(() => {
      const updatedWeekView = screen.getByTestId('week-view');
      const filteredEventsData = JSON.parse(updatedWeekView.getAttribute('data-events') || '[]');
      expect(filteredEventsData).toEqual([
        { id: '1', title: 'Event 1', resourceId: 'r1' },
        { id: '3', title: 'Event 3', resourceId: 'r1' },
      ]);
    });
  });
});
