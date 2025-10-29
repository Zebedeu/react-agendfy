import React from "react";
import { render } from "@testing-library/react";
import { renderEventComponent, CalendarPlugin } from "./renderEventComponent";
import { EventProps } from "../../../types/types";

const dummyEvent: EventProps = {
  id: "1",
  title: "Test Event",
  start: "2023-03-15T08:00:00.000Z",
  end: "2023-03-15T09:00:00.000Z",
  positionStyle: {
    top: "0",
    left: "0",
    width: "100%",
    height: "40px",
  },
};

const DummyPlugin: React.FC<any> = ({ event }) => {
  return <div data-testid="dummy-plugin">{event.title}</div>;
};

const NullPlugin: React.FC<any> = () => null;

describe("renderEventComponent", () => {
  const config = { dummy: true };
  const dayDate = new Date("2023-03-15T08:00:00.000Z");
  const onEventClick = jest.fn();
  const onEventResize = jest.fn();
  const parsedSlotMax = 10;
  const isDraggable = true;

  it("should return null when no eventRenderingPlugins are provided", () => {
    const result = renderEventComponent(
      dummyEvent,
      config,
      dayDate,
      onEventClick,
      onEventResize,
      parsedSlotMax,
      isDraggable,
      undefined
    );
    expect(result).toBeNull();
  });

  it("should return null when eventRenderingPlugins array is empty", () => {
    const result = renderEventComponent(
      dummyEvent,
      config,
      dayDate,
      onEventClick,
      onEventResize,
      parsedSlotMax,
      isDraggable,
      []
    );
    expect(result).toBeNull();
  });

  it("should render a valid element from a plugin", () => {
    const plugins: CalendarPlugin[] = [
      {
        type: "eventRenderer",
        component: DummyPlugin,
        key: "dummy-plugin",
      },
    ];
    const result = renderEventComponent(
      dummyEvent,
      config,
      dayDate,
      onEventClick,
      onEventResize,
      parsedSlotMax,
      isDraggable,
      plugins
    );
    const { getByTestId } = render(result as React.ReactElement);
    expect(getByTestId("dummy-plugin")).toHaveTextContent("Test Event");
  });

  it("should skip plugins that return null and return null if none render a valid element", () => {
    const plugins: CalendarPlugin[] = [
      {
        type: "eventRenderer",
        component: NullPlugin,
        key: "null-plugin",
      },
    ];
    const result = renderEventComponent(
      dummyEvent,
      config,
      dayDate,
      onEventClick,
      onEventResize,
      parsedSlotMax,
      isDraggable,
      plugins
    );
    expect(result?.key).toBe('null-plugin');
  });

  it("should filter only plugins of type 'eventRenderer'", () => {
    const plugins: CalendarPlugin[] = [
      {
        type: "header",
        component: DummyPlugin,
        key: "header-plugin",
      },
      {
        type: "eventRenderer",
        component: DummyPlugin,
        key: "dummy-plugin",
      },
    ];
    const result = renderEventComponent(
      dummyEvent,
      config,
      dayDate,
      onEventClick,
      onEventResize,
      parsedSlotMax,
      isDraggable,
      plugins
    );
    const { getByTestId } = render(result as React.ReactElement);
    expect(getByTestId("dummy-plugin")).toHaveTextContent("Test Event");
  });
});