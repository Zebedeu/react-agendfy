import type { ExportPlugin, EventLike, ConfigLike } from '../types/plugins';
import { downloadBlob } from '../utils/pluginUtils';

/**
 * Export PDF plugin — tenta carregar jsPDF dinamicamente (lazy) para reduzir bundle.
 * Se jsPDF não estiver disponível, retorna plain-text fallback.
 *
 * Uso: plugin.exportFunction(events, config) -> Promise<Blob | string>
 */
const exportPdfPlugin: ExportPlugin = {
  key: 'export-pdf-plugin',
  type: 'export',
  formatName: 'pdf',
  label: 'Export as PDF',
  mimeType: 'application/pdf',
  fileExtension: 'pdf',
  description: 'Generates a PDF summary of events. Uses jsPDF when available.',
  exportFunction: async (events: EventLike[], config?: ConfigLike) => {
    try {
      // import dinamicamente para evitar aumentar bundle primário
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const title = `Calendar Export - ${new Date().toLocaleString()}`;
      doc.setFontSize(14);
      doc.text(title, 40, 40);
      doc.setFontSize(10);
      let y = 70;
      events.forEach((e, idx) => {
        const start = typeof e.start === 'string' ? e.start : e.start?.toString();
        const end = typeof e.end === 'string' ? e.end : e.end?.toString();
        const line = `${idx + 1}. ${e.title ?? '(no title)'} — ${start} → ${end}`;
        doc.text(line, 40, y);
        y += 16;
        if (y > 750) { doc.addPage(); y = 40; }
      });
      const pdfBlob = doc.output('blob');
      // opcional: iniciar download automaticamente
      if (config?.autoDownload !== false) {
        downloadBlob(pdfBlob, `calendar-export-${Date.now()}.pdf`);
      }
      return pdfBlob;
    } catch (err) {
      // fallback simples em formato texto
      const header = `Calendar Export - ${new Date().toLocaleString()}\n\n`;
      const body = events.map((e, i) => `${i + 1}. ${e.title ?? '(no title)'} - ${e.start} → ${e.end}`).join('\n');
      const out = header + body;
      if (config?.autoDownload !== false) {
        downloadBlob(out, `calendar-export-${Date.now()}.txt`);
      }
      return out;
    }
  },
};

export default exportPdfPlugin;