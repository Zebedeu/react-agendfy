import type { DataSourcePlugin, EventLike } from '@react-agendfy/core';

interface GoogleCalendarConfig {
  apiKey?: string;
  clientId?: string;
  calendarId?: string;
  accessToken?: string;
}

const googleCalendarPlugin: DataSourcePlugin = {
  key: 'google-calendar',
  type: 'data-source',
  name: 'Google Calendar',
  description: 'Sync events with Google Calendar',
  
  async fetchEvents(startDate: Date, endDate: Date, config?: GoogleCalendarConfig) {
    if (!config?.accessToken) {
      throw new Error('Google Calendar plugin requires an access token');
    }

    const calendarId = encodeURIComponent(config.calendarId || 'primary');
    const timeMin = encodeURIComponent(startDate.toISOString());
    const timeMax = encodeURIComponent(endDate.toISOString());
    
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?` +
      `timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true`,
      {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.items.map((item: any): EventLike => ({
      id: item.id,
      title: item.summary,
      start: item.start.dateTime || item.start.date,
      end: item.end.dateTime || item.end.date,
      color: '#4285f4', // Google Calendar blue
      isAllDay: !item.start.dateTime,
      description: item.description,
      location: item.location,
    }));
  }
};

export default googleCalendarPlugin;