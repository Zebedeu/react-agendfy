
process.env.TZ = 'UTC'; 

import * as React from "react";
import { render, screen } from "@testing-library/react";
import { useBusinessHours, BusinessHoursConfig } from "./businessHours";


function TestBusinessHours(props: { currentDate: Date; config?: BusinessHoursConfig; }) {
  const intervals = useBusinessHours(props.currentDate, props.config);
  return React.createElement("div", { "data-testid": "intervals" }, JSON.stringify(intervals));
}

describe("useBusinessHours hook", () => {
  const config: BusinessHoursConfig = {
    enabled: true,
    intervals: [{ daysOfWeek: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "17:00" }],
  };

  it("should return intervals for a given date", () => {
    const currentDate = new Date("2023-01-03T00:00:00Z"); 
    const { container } = render(React.createElement(TestBusinessHours, { currentDate, config }));
    const intervalsText = container.querySelector("[data-testid='intervals']")?.textContent;
    const intervals = intervalsText ? JSON.parse(intervalsText) : [];
    expect(intervals).toHaveLength(1);
    const expectedStart = new Date(currentDate);
    expectedStart.setHours(9, 0, 0, 0);
    const expectedEnd = new Date(currentDate);
    expectedEnd.setHours(17, 0, 0, 0);
    expect(new Date(intervals[0].start).getTime()).toBe(expectedStart.getTime());
    expect(new Date(intervals[0].end).getTime()).toBe(expectedEnd.getTime());
  });

  it("should return an empty array if config is undefined or disabled", () => {
    const currentDate = new Date("2023-01-03T00:00:00Z");
    
    const { container: container1 } = render(
      React.createElement(TestBusinessHours, { currentDate, config: undefined })
    );
    expect(container1.querySelector("[data-testid='intervals']")?.textContent).toBe("[]");

    
    const disabledConfig: BusinessHoursConfig = {
      enabled: false,
      intervals: [{ daysOfWeek: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "17:00" }],
    };
    const { container: container2 } = render(
      React.createElement(TestBusinessHours, { currentDate, config: disabledConfig })
    );
    expect(container2.querySelector("[data-testid='intervals']")?.textContent).toBe("[]");
  });
});
