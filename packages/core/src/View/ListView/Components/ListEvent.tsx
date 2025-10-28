import React from "react";
import { TZDate } from "@date-fns/tz";
import { format, parseISO } from "date-fns";
import generateTooltipContent from "../../../Utils/generateTooltipContent";
import ResourceDisplay from "../../../Components/Resource/ResourceDisplay";
import { ListEventProps } from "../../../types/types";


export const ListEvent = ({ event, onEventClick, currentDate, config }: ListEventProps) => {
  const tooltipContent = generateTooltipContent(event, false, true, true);

  return (
    <div
      data-testid="list-event-container"
      className="react-agenfy-listevent-container"
      style={{ backgroundColor: event.color }}
      title={tooltipContent}
      onClick={() => onEventClick && onEventClick(event)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onEventClick && onEventClick(event); } }}
      role="button"
      tabIndex={0}
      aria-label={`Event: ${event.title}, from ${format(new TZDate(parseISO(event.start.toString()), config?.timeZone!), "HH:mm")} to ${format(new TZDate(parseISO(event.end.toString()), config?.timeZone!), "HH:mm")}`}
    >
      <div className="react-agenfy-listevent-content">
        <span className="react-agenfy-listevent-title">{event.title}</span>
        <span className="react-agenfy-listevent-time">
          {format(new TZDate(parseISO(event.start.toString()), config?.timeZone!), "HH:mm")} -{" "}
          {format(new TZDate(parseISO(event.end.toString()), config?.timeZone!), "HH:mm")}
        </span>
      </div>
      {event.resources && event.resources.length > 0 && (
        <div className="react-agenfy-listevent-resource">
          <ResourceDisplay resources={event.resources} maxVisible={2} />
        </div>
      )}
    </div>
  );
};
