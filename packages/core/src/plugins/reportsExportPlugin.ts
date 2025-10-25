import type { ExportPlugin, EventLike, ConfigLike } from '../types/plugins';
import { downloadBlob } from '../utils/pluginUtils';

const reportsExportPlugin: ExportPlugin = {
  key: 'reports-csv-plugin',
  type: 'export',
  formatName: 'csv',
  label: 'Generate CSV Report',
  mimeType: 'text/csv;charset=utf-8;',
  fileExtension: 'csv',
  description: 'Generates a CSV summary of events with safe escaping.',
  exportFunction: async (events: EventLike[], config?: ConfigLike) => {
    const headers = ['id', 'title', 'start', 'end', 'isAllDay', 'color'];
    const sanitize = (v: any) => {
      const s = (v ?? '').toString();
      return `"${s.replace(/"/g, '""')}"`;
    };
    const rows = events.map(e => [
      sanitize(e.id),
      sanitize(e.title),
      sanitize(e.start),
      sanitize(e.end),
      e.isAllDay ? 'true' : 'false',
      sanitize(e.color),
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    if (config?.autoDownload !== false) {
      downloadBlob(csv, `calendar-report-${Date.now()}.csv`);
    }
    return csv;
  }
};

export default reportsExportPlugin;