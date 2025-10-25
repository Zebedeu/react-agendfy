const reportsExportPlugin = {
  key: 'reports-csv-plugin',
  type: 'export',
  location: "left",
  formatName: 'csv',
  label: 'Generate CSV Report',
  mimeType: 'text/csv;charset=utf-8;',
  fileExtension: 'csv',
  description: 'Generates a CSV summary of events with safe escaping.',
  exportFunction: async (events: any[] = [], config: any = {}) => {
    const headers = ['id', 'title', 'start', 'end', 'isAllDay', 'color'];
    const sanitize = (v: any) => {
      const s = (v ?? '').toString();
      return `"${s.replace(/"/g, '""')}"`;
    };
    const rows = events.map(e =>
      [
        sanitize(e.id),
        sanitize(e.title),
        sanitize(e.start),
        sanitize(e.end),
        e.isAllDay ? 'true' : 'false',
        sanitize(e.color),
      ].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    if (config?.autoDownload !== false && typeof window !== 'undefined') {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = config?.filename || `calendar-report-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
    alert(1);
    return csv;
  },
};

export default reportsExportPlugin;