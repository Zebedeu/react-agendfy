import React, { memo, useMemo } from "react";
import {
  differenceInMinutes,
  format,
  isSameDay,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";
import { WeekTimeSlot } from "./WeekTimeSlot";
import { useBusinessHours } from "../../../Utils/businessHours";
import { DayColumnProps, EventProps } from "../../../types";
import { TZDate } from "@date-fns/tz";
import { getLocale } from "../../../Utils/locate";

export const DayColumn = memo(
  ({
    dayDate,
    events,
    timeSlots,
    parsedSlotMin, 
    onEventClick,
    onSlotClick,
    getEvents,
    parsedSlotMax, 
    onEventResize,
    redLineOffset,
    config,
    isDraggable,
    eventRenderingPlugins,
    onSelectionMouseDown,
    onSelectionMouseMove,
    isSlotSelected,
  }: DayColumnProps) => {
    const isToday = isSameDay(dayDate, new TZDate(new Date(), config?.timeZone));
    const dayStart = startOfDay(dayDate);
    
    const eventsMapping = useMemo(() => {
      const mapping: Record<string, EventProps[]> = {};
      timeSlots.forEach((index) => {
        const slotDate = setMinutes(
          setHours(dayStart, parsedSlotMin + Math.floor((index * config?.slotDuration!) / 60)),
          (index * config?.slotDuration!) % 60
        );
        const slotKey = slotDate.toISOString();
        let slotEvents = getEvents(slotKey) || [];
        mapping[slotKey] = slotEvents;
      });
      return mapping;
    }, [dayStart, parsedSlotMin, timeSlots, getEvents, config?.slotDuration]);

    const businessIntervals = useBusinessHours(dayDate, config?.businessHours);

    return (
      <div
        className={`react-agenfy-daycolumn-container react-agenfy-today ${
          isToday ? "react-agenfy-daycolumn-today" : ""
        }`}
      >
        <div
          className={`react-agenfy-daycolumn-header ${
            isToday ? "react-agenfy-daycolumn-header-today" : ""
          }`}
          onClick={() => {
            if (typeof onSlotClick === "function") onSlotClick(dayDate);
          }}
        >
          <div className="react-agenfy-daycolumn-header-text">
            <div className="react-agenfy-daycolumn-weekday">
              {format(dayDate, "EEE", { locale: getLocale(config?.lang) })}
            </div>
            <div className="react-agenfy-daycolumn-date">
              {format(dayDate, "dd/MM", { locale: getLocale(config?.lang) })}
            </div>
          </div>
        </div>
        <div
          className="react-agenfy-daycolumn-slot-container"
          style={{ minHeight: timeSlots.length * 40 }}
        >
          {businessIntervals.map((interval, idx) => {
            const top =
              (differenceInMinutes(interval.start, dayStart) / config?.slotDuration!) *
              40;
            const height =
              (differenceInMinutes(interval.end, interval.start) / config?.slotDuration!) *
              40;
            return (
              <div
                key={idx}
                style={{
                  position: "absolute",
                  top: `${top}px`,
                  height: `${height}px`,
                  left: 0,
                  right: 0,
                  backgroundColor: "rgba(0, 128, 0, 0.1)",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
            );
          })}

          {timeSlots.map((index) => {
            const slotTime = setMinutes(
              setHours(
                dayStart,
                parsedSlotMin + Math.floor((index * config?.slotDuration!) / 60)
              ),
              (index * config?.slotDuration!) % 60
            ).toISOString();
            return (
              <WeekTimeSlot
                key={`${format(dayDate, "yyyy-MM-dd")}-${index}`}
                index={index}
                dayDate={dayDate}
                slotEvents={eventsMapping[slotTime]}
                onEventClick={onEventClick}
                onSlotClick={onSlotClick}
                slotMin={parsedSlotMin}
                config={config}
                parsedSlotMax={parsedSlotMax}
                onEventResize={onEventResize}
                isDraggable={isDraggable}
                eventRenderingPlugins={eventRenderingPlugins}
                onSelectionMouseDown={onSelectionMouseDown}
                onSelectionMouseMove={onSelectionMouseMove}
                isSelected={isSlotSelected(new TZDate(slotTime, config?.timeZone))}
              />
            );
          })}
          <div
            style={{
              position: "absolute",
              top: `${redLineOffset}px`,
              left: 0,
              right: 0,
              borderTop: "2px dashed red",
              zIndex: 1,
            }}
          />
        </div>
      </div>
    );
  }
);
