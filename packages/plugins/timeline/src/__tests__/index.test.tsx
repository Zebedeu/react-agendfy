import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import timelineViewPlugin from '../index';

const { component: TimelineView } = timelineViewPlugin;

describe('Timeline View Plugin', () => {
  const mockEvents = [
    {
      id: '1',
      title: 'Test Event',
      start: '2025-01-01T10:00:00',
      end: '2025-01-01T11:00:00'
    }
  ];

  it('should render events', () => {
    render(<TimelineView events={mockEvents} currentDate={new Date()} />);
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('should handle event clicks', () => {
    const onEventClick = jest.fn();
    render(
      <TimelineView 
        events={mockEvents} 
        currentDate={new Date()} 
        onEventClick={onEventClick} 
      />
    );
    
    fireEvent.click(screen.getByText('Test Event'));
    expect(onEventClick).toHaveBeenCalledWith(mockEvents[0]);
  });
});