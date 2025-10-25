import googleCalendarPlugin from '../index';

describe('Google Calendar Plugin', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('should fetch events from Google Calendar', async () => {
    const mockResponse = {
      items: [{
        id: '1',
        summary: 'Test Event',
        start: { dateTime: '2025-01-01T10:00:00Z' },
        end: { dateTime: '2025-01-01T11:00:00Z' }
      }]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const events = await googleCalendarPlugin.fetchEvents(
      new Date('2025-01-01'),
      new Date('2025-01-02'),
      { accessToken: 'test-token' }
    );

    expect(events[0].title).toBe('Test Event');
  });

  it('should throw error without access token', async () => {
    await expect(googleCalendarPlugin.fetchEvents(
      new Date(),
      new Date()
    )).rejects.toThrow('requires an access token');
  });
});