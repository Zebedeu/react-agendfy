import exportPdfPlugin from '../index';

describe('PDF Export Plugin', () => {
  const mockEvents = [
    {
      id: '1',
      title: 'Test Event',
      start: '2025-01-01T10:00:00',
      end: '2025-01-01T11:00:00'
    }
  ];

  it('should have correct plugin metadata', () => {
    expect(exportPdfPlugin.key).toBe('export-pdf-plugin');
    expect(exportPdfPlugin.type).toBe('export');
    expect(exportPdfPlugin.formatName).toBe('pdf');
  });

  it('should generate PDF blob', async () => {
    const result = await exportPdfPlugin.exportFunction(mockEvents);
    expect(result).toBeInstanceOf(Blob);
  });

  it('should handle errors gracefully', async () => {
    const invalidEvents = [{ id: '1' }];
    await expect(exportPdfPlugin.exportFunction(invalidEvents))
      .rejects.toThrow();
  });
});