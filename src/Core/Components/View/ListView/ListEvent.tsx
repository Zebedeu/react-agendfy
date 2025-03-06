import React from "react";
import { TZDate } from "@date-fns/tz";
import { format, parseISO } from "date-fns";
import generateTooltipContent from "../../../../Utils/generateTooltipContent";
import ResourceDisplay from "../../Resource/ResourceDisplay";
import { ListEventProps } from "../../../../types";

export const ListEvent = ({ event, onEventClick, currentDate, config }: ListEventProps) => { // Add config prop
  const tooltipContent = generateTooltipContent(event, false, true, true);

  return (
    <div
    data-testid="list-event-container"
      className="p-3 my-2 rounded-lg cursor-pointer flex items-center justify-between shadow-md transition transform hover:scale-105"
      style={{ backgroundColor: event.color }}
      title={tooltipContent}
      onClick={() => onEventClick && onEventClick(event)}
    >
      <div className="flex flex-col">
        <span className="font-bold text-sm text-white">{event.title}</span>
        <span className="text-xs text-white">
          {format(new TZDate(parseISO(event.start.toString()), config?.timeZone!), "HH:mm")} - {format(new TZDate(parseISO(event.end.toString()), config?.timeZone!), "HH:mm")} {/* Use TZDate and timezone */}
        </span>
      </div>
      {event.resources && event.resources.length > 0 && (
        <div className="ml-3">
          <ResourceDisplay resources={event.resources} />
        </div>
      )}
    </div>
  );
};
