import { Config, EventProps } from "../../types";
import { DataSourcePlugin } from "../../types/DataSource";

interface GoogleCalendarConfig {
  apiKey: string;
  calendarId: string;
}

const googleCalendarPlugin: DataSourcePlugin = {
  type: 'dataSource',
  name: 'Google Calendar',
  fetchEvents: async (startDate: Date, endDate: Date, config: Config): Promise<EventProps[]> => {
    // Replace with your actual Google Calendar API logic
    const apiKey = 'AIzaSyA2CPMCfihik21E8i63VymrLvGQC60balA';
    const calendarId = '913943508065-llme8jkh1ev53vqeabvaine6t0d97qr8.apps.googleusercontent.com';
    const startTime = startDate.toISOString();
    const endTime = endDate.toISOString();

    const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&timeMin=${startTime}&timeMax=${endTime}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.items.map((item: any) => ({
        id: item.id,
        title: item.summary || 'No Title',
        start: new Date(item.start.dateTime || item.start.date),
        end: new Date(item.end.dateTime || item.end.date),
        // Map other properties as needed
      }));
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      throw error;
    }
  },
  // Optional configuration component
  // component: GoogleCalendarConfigComponent,
};

export default googleCalendarPlugin;