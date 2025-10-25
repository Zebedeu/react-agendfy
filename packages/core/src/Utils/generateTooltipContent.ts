import { format } from 'date-fns';

/**
 * Generates the tooltip content for a calendar event.
 *
 * @param {Object} event - The event object.
 * @param {boolean} isMultiDay - Indicates if the event spans multiple days.
 * @param {boolean} isStart - Indicates if the event is the start of a multi-day event.
 * @param {boolean} isEnd - Indicates if the event is the end of a multi-day event.
 * @returns {string} - tooltip content
 */

function generateTooltipContent(event, isMultiDay, isStart, isEnd) {
  const eventStart = new Date(event.start);
  const eventEnd = new Date(event.end);
  

  const timeDisplay = isMultiDay
    ? isStart
      ? `Start: ${format(eventStart, 'HH:mm')}`
      : isEnd
        ? `Fim: ${format(eventEnd, 'HH:mm')}`
        : 'All day'
    : `${format(eventStart, 'HH:mm')} - ${format(eventEnd, 'HH:mm')}`;
  
  const displayTitle = event.title;

  const resourcesInfo = event.resources && event.resources.length > 0
    ? `\n\n: ${event.resources.map(r => r.name).join(', ')}`
    : '';

  const tooltipContent = `${displayTitle}\n\n${timeDisplay}${event?.isRecurrenceInstance ? '\n\n()' : ''}${resourcesInfo}`;

  return tooltipContent;
}

export default generateTooltipContent;