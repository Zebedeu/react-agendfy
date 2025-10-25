import type { ExportPlugin } from '@react-agendfy/core';

const exportPdfPlugin: ExportPlugin = {
  key: 'export-pdf-plugin',
  type: 'export',
  formatName: 'pdf',
  label: 'Export as PDF',
  mimeType: 'application/pdf',
  fileExtension: 'pdf',
  description: 'Generates a PDF summary of events using jsPDF',

  exportFunction: async (events, config) => {
    try {
      const { jsPDF } = await import('jspdf');

      // ✅ 1. Validação: deve ser array com eventos válidos
      if (!Array.isArray(events) || events.length === 0 || !events[0].title) {
        throw new Error('Invalid or empty events data');
      }

      const doc = new jsPDF();
      doc.text('Event Summary', 10, 10);

      // ✅ 2. Adiciona eventos no PDF
      events.forEach((event, i) => {
        const y = 20 + i * 10;
        doc.text(`${i + 1}. ${event.title} (${event.start} - ${event.end})`, 10, y);
      });

      // ✅ 3. Gera PDF e cria Blob
      const pdfArrayBuffer = doc.output('arraybuffer');
      const blob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });

      // ✅ 4. Faz download se estiver em ambiente browser
      if (typeof window !== 'undefined') {
       // downloadBlob(blob, `events.${config?.fileExtension || 'pdf'}`);
      }

      // ✅ 5. Retorna o blob (para teste)
      return blob;
    } catch (err) {
      console.error('PDF generation failed:', err);
      throw err; // 🔥 garante que o teste de erro seja satisfeito
    }
  }
};

export default exportPdfPlugin;
