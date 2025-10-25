import React, { useState } from "react";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { getLocale } from "../Utils/locate";
import { CalendarHeaderProps, Resource } from "../types";


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
  exportOptions,
  leftControls,
  rightControls,
}) => {
  const [selectedResources, setSelectedResources] = useState<Resource[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

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
      {leftControls && <div className="react-agenfy-header-controls-left">{leftControls}</div>}

      <div className="react-agenfy-date-nav">
        <button
  data-testid="btn-back"
  onClick={onNavigateBack}
  className="react-agenfy-btn"
  aria-label={`Back ${currentView}`}
>
  &lt;
</button>

<button
  data-testid="btn-today"
  onClick={onNavigateToday}
  className="react-agenfy-btn"
  aria-label="Go to today"
>
  {config.today}
</button>

<button
  data-testid="btn-forward"
  onClick={onNavigateForward}
  className="react-agenfy-btn"
  aria-label={`Next ${currentView}`}
>
  &gt;
</button>
      </div>
      <h2 className="react-agenfy-calendar-header-date">{displayDate()}</h2>

      <div className="react-agenfy-header-actions">
        <div className="react-agenfy-view-buttons">
        {availableViews.map((viewInfo) => (
            <button
              key={viewInfo.name}
              onClick={() => onViewChange(viewInfo.name)}
              className={`react-agenfy-view-btn ${currentView === viewInfo.name ? "react-agenfy-view-btn-active" : ""}`}
              aria-current={currentView === viewInfo.name ? "page" : undefined}
            >
              {viewInfo.label}
            </button>
          ))}
        </div>

        <div className="react-agenfy-filter-container">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="react-agenfy-filter-btn"
            aria-haspopup="true"
            aria-expanded={filterOpen}
            aria-controls="filter-dropdown"
          >
            {config.filter_resources} {selectedResources.length > 0 && `(${selectedResources.length})`}
          </button>
          {filterOpen && (
            <div id="filter-dropdown" className="react-agenfy-filter-dropdown" role="menu">
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
          <div className="react-agenfy-export-container">
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="react-agenfy-download-btn"
              aria-haspopup="true"
              aria-expanded={exportMenuOpen}
              aria-controls="export-dropdown"
            >
              {config.calendar_export}
            </button>
            {exportMenuOpen && (
              <div id="export-dropdown" className="react-agenfy-export-dropdown" role="menu">
                <div className="react-agenfy-export-option" onClick={() => { onDownloadcalendar('ics'); setExportMenuOpen(false); }}>
                  Export to .ics
                </div>
                <div className="react-agenfy-export-option" onClick={() => { onDownloadcalendar('csv'); setExportMenuOpen(false); }}>
                  Export to .csv
                </div>
                <div className="react-agenfy-export-option" onClick={() => { onDownloadcalendar('json'); setExportMenuOpen(false); }}>
                  Export to .json
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {rightControls && <div className="react-agenfy-header-controls-right">{rightControls}</div>}
    </div>
  );
};

export default CalendarHeader;