import type { DataSourcePlugin, EventLike, ConfigLike } from '../types/plugins';

/**
 * Google Calendar plugin (production-ready shape).
 * - NÃO implementa fluxo OAuth. Recebe accessToken via config.accessToken
 * - Pode receber config.calendarId ou usar 'primary'
 * - Retorna EventLike[]
 */
const googleCalendarPlugin: DataSourcePlugin = {
  key: 'google-calendar-plugin',
  type: 'data-source',
  name: 'GoogleCalendar',
  description: 'Fetch events from Google Calendar. Requires config.accessToken (OAuth2 token).',
  fetchEvents: async (startDate: Date, endDate: Date, config?: ConfigLike) => {
    if (!config?.accessToken) {
      throw new Error('googleCalendarPlugin: accessToken required in config');
    }
    const calendarId = config.calendarId ?? 'primary';
    const timeMin = startDate.toISOString();
    const timeMax = endDate.toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        Accept: 'application/json',
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Google Calendar API error: ${res.status} ${text}`);
    }
    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];
    const mapped: EventLike[] = items.map((it: any) => ({
      id: it.id,
      title: it.summary || 'No title',
      start: it.start?.dateTime ?? it.start?.date ?? null,
      end: it.end?.dateTime ?? it.end?.date ?? null,
      color: config.eventColor || undefined,
      original: it,
    }));
    return mapped;
  },
};

export default googleCalendarPlugin;