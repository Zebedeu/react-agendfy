import React, { useState } from "react";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { getLocale } from "../../Utils/locate";
import { config } from "../../Utils/config";
import { CalendarHeaderProps, Resource } from "../../types";

const CalendarHeader = ({
  view,
  onViewChange,
  currentDate,
  onNavigateToday,
  onNavigateBack,
  onNavigateForward,
  config,
  resources = [],
  onResourceFilterChange,
}: CalendarHeaderProps) => {
  const [selectedResources, setSelectedResources] = useState<Resource[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const displayDate = () => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy", { locale: getLocale(config.lang) });
    } else if (view === "week") {
      const start = format(startOfWeek(currentDate, { weekStartsOn: 0 }), "dd MMM", {
        locale: getLocale(config.lang),
      });
      const end = format(endOfWeek(currentDate, { weekStartsOn: 0 }), "dd MMM yyyy", {
        locale: getLocale(config.lang),
      });
      return `${start} - ${end}`;
    } else if (view === "day") {
      return format(currentDate, "EEE, dd MMMM yyyy", { locale: getLocale(config.lang) });
    } else {
      return format(currentDate, "EEE, dd MMMM yyyy", { locale: getLocale(config.lang) });
    }
  };

  const handleResourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const resourceId = e.target.value;
    const isChecked = e.target.checked;
    let newSelected;
    if (isChecked) {
      newSelected = [...selectedResources, resourceId];
    } else {
      newSelected = selectedResources.filter((id) => id !== resourceId);
    }
    setSelectedResources(newSelected);
    onResourceFilterChange(newSelected);
  };

  return (
    <div className="react-agenfy-calendar-header">
      {/* Navegação de datas */}
      <div className="react-agenfy-date-nav">
        <button onClick={onNavigateBack} className="react-agenfy-btn">
          &lt;
        </button>
        <button onClick={onNavigateToday} className="react-agenfy-btn">
          {config.today}
        </button>
        <button onClick={onNavigateForward} className="react-agenfy-btn">
          &gt;
        </button>
      </div>

      {/* Exibição da data */}
      <h2 className="react-agenfy-calendar-header-date">{displayDate()}</h2>

      {/* Botões de visualização e filtro */}
      <div className="react-agenfy-header-actions">
        <div className="react-agenfy-view-buttons">
          <button
            onClick={() => onViewChange("month")}
            className={`react-agenfy-view-btn ${view === "month" ? "react-agenfy-view-btn-active" : ""}`}
          >
            {config.monthView}
          </button>
          <button
            onClick={() => onViewChange("week")}
            className={`react-agenfy-view-btn ${view === "week" ? "react-agenfy-view-btn-active" : ""}`}
          >
            {config.weekView}
          </button>
          <button
            onClick={() => onViewChange("day")}
            className={`react-agenfy-view-btn ${view === "day" ? "react-agenfy-view-btn-active" : ""}`}
          >
            {config.dayView}
          </button>
          <button
            onClick={() => onViewChange("list")}
            className={`react-agenfy-view-btn ${view === "list" ? "react-agenfy-view-btn-active" : ""}`}
          >
            {config.listView}
          </button>
        </div>

        {/* Filtro de Recursos */}
        <div className="react-agenfy-filter-container">
          <button onClick={() => setFilterOpen(!filterOpen)} className="react-agenfy-filter-btn">
            {config.filter_resources}{" "}
            {selectedResources.length > 0 && `(${selectedResources.length})`}
          </button>
          {filterOpen && (
            <div className="react-agenfy-filter-dropdown">
              {resources.map((resource: Resource) => (
                <label key={resource.id} className="react-agenfy-filter-option">
                  <input
                    type="checkbox"
                    value={resource.id}
                    checked={selectedResources.includes(resource.id)}
                    onChange={handleResourceChange}
                    className="react-agenfy-checkbox"
                  />
                  <span className="react-agenfy-resource-label">{resource.name}</span>
                </label>
              ))}
              <button
                onClick={() => {
                  setSelectedResources([]);
                  onResourceFilterChange([]);
                }}
                className="react-agenfy-clear-btn"
              >
                {config.clear_filter}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
