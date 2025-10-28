import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TZDate } from '@date-fns/tz';
import { DayColumn } from './DayColumn';

jest.mock('./WeekTimeSlot', () => ({
  WeekTimeSlot: ({ index }: any) => (
    <div data-testid="week-time-slot">WeekTimeSlot {index}</div>
  ),
}));


jest.mock('../../../Utils/businessHours', () => ({
  useBusinessHours: jest.fn(() => {
    const day = new Date('2023-01-01T00:00:00Z');
    const { startOfDay, setHours } = require('date-fns');
    const start = setHours(startOfDay(day), 9);
    const end = setHours(startOfDay(day), 17);
    return [{ start, end }];
  }),
}));

describe('DayColumn Component', () => {
  const dummyConfig = {
    timeZone: 'UTC',
    slotDuration: 15,
    businessHours: { enabled: true },
    all_day: 'All Day',
    
  };

  const dummyDayDate = new Date('2023-01-01T12:00:00Z');
  const dummyTimeSlots = Array.from({ length: 4 }, (_, i) => i);
  const dummyEvents = [
    {
      id: '1',
      title: 'Event 1',
      start: '2023-01-01T12:00:00Z',
      end: '2023-01-01T12:30:00Z',
    },
  ];
  const dummyGetEvents = jest.fn(() => []);
  const dummyOnEventClick = jest.fn();
  const dummyOnSlotClick = jest.fn();
  const dummyOnEventResize = jest.fn();
  const dummyRedLineOffset = 50;
  const dummyParsedSlotMin = 0;
  const dummyParsedSlotMax = 24;
  const dummyIsDraggable = true;
  const dummyIsSlotSelected = jest.fn(() => false);

  it('renders header with day label and date and calls onSlotClick when clicked', () => {
    render(
      <DayColumn
        dayDate={dummyDayDate}
        events={dummyEvents}
        timeSlots={dummyTimeSlots}
        parsedSlotMin={dummyParsedSlotMin}
        onEventClick={dummyOnEventClick}
        onSlotClick={dummyOnSlotClick}
        getEvents={dummyGetEvents}
        parsedSlotMax={dummyParsedSlotMax}
        onEventResize={dummyOnEventResize}
        redLineOffset={dummyRedLineOffset}
        config={dummyConfig}
        isDraggable={dummyIsDraggable}
        isSlotSelected={dummyIsSlotSelected}
      />
    );
  
    expect(screen.getByText(/Sun/i)).toBeInTheDocument();
    expect(screen.getByText(/01\/01/i)).toBeInTheDocument();
  
    const headerDiv = screen.getByText((content, element) =>
      element?.className.includes('react-agenfy-header-today')
    );
    fireEvent.click(headerDiv);
    expect(dummyOnSlotClick).toHaveBeenCalled();
  });
  

  it('renders WeekTimeSlot components for each time slot', () => {
    render(
      <DayColumn
        dayDate={dummyDayDate}
        events={dummyEvents}
        timeSlots={dummyTimeSlots}
        parsedSlotMin={dummyParsedSlotMin}
        onEventClick={dummyOnEventClick}
        onSlotClick={dummyOnSlotClick}
        getEvents={dummyGetEvents}
        parsedSlotMax={dummyParsedSlotMax}
        onEventResize={dummyOnEventResize}
        redLineOffset={dummyRedLineOffset}
        config={dummyConfig}
        isDraggable={dummyIsDraggable}
        isSlotSelected={dummyIsSlotSelected}
      />
    );
    
    const timeSlotElements = screen.getAllByTestId('week-time-slot');
    expect(timeSlotElements.length).toBe(dummyTimeSlots.length);
  });

  it('applies today styling if dayDate is today', () => {
    const today = new TZDate(new Date());
    render(
      <DayColumn
        dayDate={today}
        events={dummyEvents}
        timeSlots={dummyTimeSlots}
        parsedSlotMin={dummyParsedSlotMin}
        onEventClick={dummyOnEventClick}
        onSlotClick={dummyOnSlotClick}
        getEvents={dummyGetEvents}
        parsedSlotMax={dummyParsedSlotMax}
        onEventResize={dummyOnEventResize}
        redLineOffset={dummyRedLineOffset}
        config={dummyConfig}
        isDraggable={dummyIsDraggable}
        isSlotSelected={dummyIsSlotSelected}
      />
    );
    const topLevelDiv = document.querySelector('div.react-agenfy-daycolumn-container');
    expect(topLevelDiv?.className).toMatch(/react-agenfy-today/);
  });

  it('renders business intervals overlay', () => {
    render(
      <DayColumn
        dayDate={dummyDayDate}
        events={dummyEvents}
        timeSlots={dummyTimeSlots}
        parsedSlotMin={dummyParsedSlotMin}
        onEventClick={dummyOnEventClick}
        onSlotClick={dummyOnSlotClick}
        getEvents={dummyGetEvents}
        parsedSlotMax={dummyParsedSlotMax}
        onEventResize={dummyOnEventResize}
        redLineOffset={dummyRedLineOffset}
        config={dummyConfig}
        isDraggable={dummyIsDraggable}
        isSlotSelected={dummyIsSlotSelected}
      />
    );
    const overlayDiv = document.querySelector('div[style*="rgba(0, 128, 0, 0.1)"]');
    expect(overlayDiv).toBeInTheDocument();
  });
});
