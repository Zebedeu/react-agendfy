import React, { useState } from "react";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { getLocale } from "../../Utils/locate";
import { CalendarHeaderProps, Resource } from "../../types";


const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentView,
  availableViews,
  onViewChange,
  currentDate,
  onNavigateToday,
  onNavigateBack,
  onNavigateForward,
  config,
  resources,
  onResourceFilterChange,
  onDownloadcalendar,
  leftControls,
  rightControls,
}) => {
  const [selectedResources, setSelectedResources] = useState<Resource[]>([]); // Changed to stringfor simplicity based on usage
  const [filterOpen, setFilterOpen] = useState(false);

  const displayDate = () => {
    if (currentView === "month") {
      return format(currentDate, "MMMM yyyy", { locale: getLocale(config.lang) });
    } else if (currentView === "week") {
      const start = format(startOfWeek(currentDate, { weekStartsOn: 0 }), "dd MMM", {
        locale: getLocale(config.lang),
      });
      const end = format(endOfWeek(currentDate, { weekStartsOn: 0 }), "dd MMM yyyy", {
        locale: getLocale(config.lang),
      });
      return `${start} - ${end}`;
    } else if (currentView === "day") {
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
      {/* Left Controls Plugin */}
      {leftControls && <div className="react-agenfy-header-controls-left">{leftControls}</div>}

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
        {availableViews.map(viewInfo => (
            <button
              key={viewInfo.name}
              onClick={() => onViewChange(viewInfo.name)}
              className={`react-agenfy-view-btn ${currentView === viewInfo.name ? "react-agenfy-view-btn-active" : ""}`}
            >
              {viewInfo.label}
            </button>
          ))}
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
        {config.export && (
          <button onClick={onDownloadcalendar} className="react-agenfy-download-btn">{config.calendar_export}</button>
        )}
      </div>

      {/* Right Controls Plugin */}
      {rightControls && <div className="react-agenfy-header-controls-right">{rightControls}</div>}
    </div>
  );
};

export default CalendarHeader;