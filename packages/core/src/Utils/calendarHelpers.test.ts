import { defaultResource, normalizeEvents, filterEvents } from './calendarHelpers';

describe('calendarHelpers', () => {
  describe('normalizeEvents', () => {
    it('should add the default resource if an event has no resources property', () => {
      const events = [
        { id: 1, title: 'Event 1' },
      ];
      const normalized = normalizeEvents(events);
      expect(normalized).toEqual([
        { id: 1, title: 'Event 1', resources: [defaultResource] },
      ]);
    });

    it('should add the default resource if an event has an empty resources array', () => {
      const events = [
        { id: 1, title: 'Event 1', resources: [] },
      ];
      const normalized = normalizeEvents(events);
      expect(normalized).toEqual([
        { id: 1, title: 'Event 1', resources: [defaultResource] },
      ]);
    });

    it('should not modify events that already have resources', () => {
      const events = [
        { id: 1, title: 'Event 1', resources: [{ id: 'r1', name: 'Resource 1' }] },
      ];
      const normalized = normalizeEvents(events);
      expect(normalized).toEqual(events);
    });
  });

  describe('filterEvents', () => {
    const eventWithResources = { id: 1, title: 'Event 1', resources: [{ id: 'r1', name: 'Resource 1' }] };
    const eventWithoutResources = { id: 2, title: 'Event 2' };
    const eventWithMultipleResources = { id: 3, title: 'Event 3', resources: [{ id: 'r2', name: 'Resource 2' }, { id: 'r3', name: 'Resource 3' }] };

    it('should return all events if no local filtered resources are provided', () => {
      const events = [eventWithResources, eventWithoutResources, eventWithMultipleResources];
      const filtered = filterEvents(events, []);
      expect(filtered).toEqual(events);
    });

    it('should return only events that include at least one filtered resource', () => {
      const events = [eventWithResources, eventWithMultipleResources];
      const filtered = filterEvents(events, ['r1']);
      expect(filtered).toEqual([eventWithResources]);
    });

    it('should return events with resources if the filtered resources array is empty', () => {
      const events = [eventWithResources, eventWithoutResources, eventWithMultipleResources];
      const filtered = filterEvents(events, []);
      expect(filtered).toEqual(events);
    });

    it('should filter out events without resources when filtered resources is not empty', () => {
      const events = [eventWithoutResources];
      const filtered = filterEvents(events, ['r1']);
      expect(filtered).toEqual([]);
    });
  });
});
