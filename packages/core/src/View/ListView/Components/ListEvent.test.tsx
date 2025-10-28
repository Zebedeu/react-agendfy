import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ListEvent } from './ListEvent';
import { Config, EventProps } from '../../../types/types';

jest.mock('../../../Utils/generateTooltipContent.ts', () => (event) => `Tooltip for ${event.title}`);

describe('ListEvent Component', () => {
  const defaultEvent: EventProps = {
    id: '1',
    title: 'Test Event',
    start: new Date('2024-01-01T10:00:00.000Z').toISOString(),
    end: new Date('2024-01-01T11:00:00.000Z').toISOString(),
    color: '#abcdef',
    isAllDay: true,
    isMultiDay: true,
    resources: [],
  };

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

  it('Should render the ListEvent component without errors', () => {
    render(<ListEvent event={defaultEvent} currentDate={new Date()} config={defaultConfig} />);
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('Should display the event title', () => {
    render(<ListEvent event={defaultEvent} currentDate={new Date()} config={defaultConfig} />);
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('Should display the formatted event start and end time', () => {
    const { debug } = render(<ListEvent event={defaultEvent} currentDate={new Date()} config={defaultConfig} />);
    debug();
    expect(screen.getByText('10:00 - 11:00')).toBeInTheDocument();
   });
 
  it('Should render ResourceDisplay if the event has resources', () => {
    const eventWithResources: EventProps = {
      ...defaultEvent,
      resources: [{ id: 'r1', name: 'Sala 1', type: 'room' }],
    };
    render(<ListEvent event={eventWithResources} currentDate={new Date()} config={defaultConfig} />);
    expect(screen.getByTestId('resource-display-container')).toBeInTheDocument();
  });

  it('Should not render ResourceDisplay if the event has no resources', () => {
    render(<ListEvent event={defaultEvent} currentDate={new Date()} config={defaultConfig} />);
    expect(screen.queryByRole('resource-display')).not.toBeInTheDocument();
  });


  it('Should apply the backgroundColor style with the event color', () => {
    render(<ListEvent event={defaultEvent} currentDate={new Date()} config={defaultConfig} />);
    const listEventDiv = screen.getByTestId('list-event-container');
    expect(listEventDiv).toHaveStyle({ backgroundColor: '#abcdef' });
  });
 
  it('Should call onEventClick when the component is clicked', () => {
    const onEventClickMock = jest.fn();
    render(<ListEvent event={defaultEvent} currentDate={new Date()} config={defaultConfig} onEventClick={onEventClickMock} />);
    fireEvent.click(screen.getByTestId('list-event-container'));
    expect(onEventClickMock).toHaveBeenCalledTimes(1);
    expect(onEventClickMock).toHaveBeenCalledWith(defaultEvent);

  });


  it('Should set the "title" attribute with the generated tooltip content', () => {
    const { container } = render(<ListEvent event={defaultEvent} currentDate={new Date()} config={defaultConfig} />);
    const listEventDiv = container.querySelector('div.react-agenfy-listevent-container') as HTMLElement;
    expect(listEventDiv).toHaveAttribute('title', 'Tooltip for Test Event');
  });

 
});