import { format } from 'date-fns';

/**
 * Gera o conteúdo do tooltip para um evento de calendário.
 *
 * @param {Object} event - O objeto do evento.
 * @param {boolean} isMultiDay - Indica se o evento é multi-dia.
 * @param {boolean} isStart - Indica se o evento é o início de um evento multi-dia.
 * @param {boolean} isEnd - Indica se o evento é o fim de um evento multi-dia.
 * @returns {string} - O conteúdo do tooltip.
 */
function generateTooltipContent(event, isMultiDay, isStart, isEnd) {
  const eventStart = new Date(event.start);
  const eventEnd = new Date(event.end);
  

  // Exibição do tempo
  const timeDisplay = isMultiDay
    ? isStart
      ? `Start: ${format(eventStart, 'HH:mm')}`
      : isEnd
        ? `Fim: ${format(eventEnd, 'HH:mm')}`
        : 'All day'
    : `${format(eventStart, 'HH:mm')} - ${format(eventEnd, 'HH:mm')}`;

  // Exibição do título
  const displayTitle = isMultiDay && isStart ? event.title : !isMultiDay ? event.title : ""; //alterado para string vazia, pois o \b não é para ser usado em tooltip

  // Informações de recursos
  const resourcesInfo = event.resources && event.resources.length > 0
    ? `\n\n: ${event.resources.map(r => r.name).join(', ')}`
    : '';

  // Conteúdo completo do tooltip
  const tooltipContent = `${displayTitle}\n\n${timeDisplay}${event?.isRecurrenceInstance ? '\n\n()' : ''}${resourcesInfo}`;

  return tooltipContent;
}

export default generateTooltipContent;