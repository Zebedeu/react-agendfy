import React, { ReactElement, ComponentType } from 'react';
import { EventProps } from "../../../types";

export interface CalendarPlugin {
  type: string;
  location?: string;
  viewName?: string;
  component: ComponentType<any>;
  props?: Record<string, any>;
  key?: string;
}

export const renderEventComponent = (
  event: EventProps,
  config: any,
  dayDate: Date,
  onEventClick: (event: EventProps) => void,
  onEventResize: (event: EventProps) => void,
  parsedSlotMax: number,
  isDraggable: boolean,
  eventRenderingPlugins?: CalendarPlugin[]
): ReactElement | null => {
  if (eventRenderingPlugins && eventRenderingPlugins.length > 0) {
    const rendererPlugins = eventRenderingPlugins.filter(
      (plugin) => plugin.type === "eventRenderer" && plugin.component !== undefined
    );
    for (const plugin of rendererPlugins) {
      const PluginComponent = plugin.component;
      if (!PluginComponent) continue;
      const element = (
        <PluginComponent
          key={plugin.key || `plugin-${event.id}`}
          event={event}
          config={config}
          dayDate={dayDate}
          onEventClick={onEventClick}
          onEventResize={onEventResize}
          positionStyle={event.positionStyle}
          endHour={parsedSlotMax}
          isDraggable={isDraggable}
          {...(plugin.props || {})}
        />
      );
      if (React.isValidElement(element)) {
        return element;
      }
    }
  }
  return null;
};
