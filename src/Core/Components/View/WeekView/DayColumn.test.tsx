// DayColumn.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DayColumn } from './DayColumn';
import { TZDate } from '@date-fns/tz';

// Mock the WeekTimeSlot component to control its rendering
jest.mock('./WeekTimeSlot', () => ({
  WeekTimeSlot: ({ index }: any) => (
    <div data-testid="week-time-slot">WeekTimeSlot {index}</div>
  ),
}));

// Mock the useBusinessHours hook to return a dummy interval
jest.mock('../../../../Utils/businessHours', () => ({
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
    lang: 'en ', // Objeto de locale válido
  };

  const dummyDayDate = new Date('2023-01-01T12:00:00Z');
  // Create 4 time slots for simplicity
  const dummyTimeSlots = Array.from({ length: 4 }, (_, i) => i);
  const dummyEvents = [
    {
      id: '1',
      title: 'Event 1',
      start: '2023-01-01T12:00:00Z',
      end: '2023-01-01T12:30:00Z',
    },
  ];
  // Dummy getEvents returns an empty array for each slot key
  const dummyGetEvents = jest.fn(() => []);
  const dummyOnEventClick = jest.fn();
  const dummyOnSlotClick = jest.fn();
  const dummyOnEventResize = jest.fn();
  const dummyRedLineOffset = 50;
  const dummyParsedSlotMin = 0;
  const dummyParsedSlotMax = 24;
  const dummyIsDraggable = true;

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
      />
    );
  
    // Verifica se o cabeçalho exibe a abreviação do dia (ex: "Sun") e a data (ex: "01/01")
    expect(screen.getByText(/Sun/i)).toBeInTheDocument();
    expect(screen.getByText(/01\/01/i)).toBeInTheDocument();
  
    // Procura a div com classe "cursor-pointer" e simula um clique
    const headerDiv = screen.getByText((content, element) =>
      element?.className.includes('cursor-pointer')
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
      />
    );
    // Expect one WeekTimeSlot per time slot (4 in our dummyTimeSlots)
    const timeSlotElements = screen.getAllByTestId('week-time-slot');
    expect(timeSlotElements.length).toBe(dummyTimeSlots.length);
  });

  it('applies today styling if dayDate is today', () => {
    // Set dayDate to today.
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
      />
    );
    // The top-level div should have the "bg-blue-50" class if the day is today
    const topLevelDiv = document.querySelector('div.flex-1');
    expect(topLevelDiv?.className).toMatch(/bg-blue-50/);
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
      />
    );
    // The overlay div for business hours should have a background color of "rgba(0, 128, 0, 0.1)"
    const overlayDiv = document.querySelector('div[style*="rgba(0, 128, 0, 0.1)"]');
    expect(overlayDiv).toBeInTheDocument();
  });
});
