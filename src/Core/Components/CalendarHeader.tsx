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
      const start = format(startOfWeek(currentDate, { weekStartsOn: 0 }), "dd MMM", { locale: getLocale(config.lang) });
      const end = format(endOfWeek(currentDate, { weekStartsOn: 0 }), "dd MMM yyyy", { locale: getLocale(config.lang) });
      return `${start} - ${end}`;
    } else if (view === "day") {
      return format(currentDate, "EEE, dd MMMM yyyy", { locale: getLocale(config.lang) });
    } else {
      return format(currentDate, "EEE, dd MMMM yyyy", { locale: getLocale(config.lang) });
    }
  };

  const handleResourceChange = (e) => {
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
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      {/* Navegação de datas */}
      <div className="flex items-center space-x-2">
        <button onClick={onNavigateBack} className="p-2 rounded hover:bg-gray-200">
          &lt;
        </button>
        <button onClick={onNavigateToday} className="p-2 rounded hover:bg-gray-200">
          {config.today}
        </button>
        <button onClick={onNavigateForward} className="p-2 rounded hover:bg-gray-200">
          &gt;
        </button>
      </div>

      {/* Exibição da data */}
      <h2 className="text-xl font-semibold">{displayDate()}</h2>

      {/* Botões de visualização e filtro */}
      <div className="flex items-center space-x-4">
        <div className="flex space-x-2">
          <button
            onClick={() => onViewChange("month")}
            className={`p-2 rounded hover:bg-gray-200 ${view === "month" ? "bg-blue-200" : ""}`}
          >
            {config.monthView}
          </button>
          <button
            onClick={() => onViewChange("week")}
            className={`p-2 rounded hover:bg-gray-200 ${view === "week" ? "bg-blue-200" : ""}`}
          >
            {config.weekView}
          </button>
          <button
            onClick={() => onViewChange("day")}
            className={`p-2 rounded hover:bg-gray-200 ${view === "day" ? "bg-blue-200" : ""}`}
          >
            {config.dayView}
          </button>
          <button
            onClick={() => onViewChange("list")}
            className={`p-2 rounded hover:bg-gray-200 ${view === "list" ? "bg-blue-200" : ""}`}
          >
            {config.listView}
          </button>
        </div>

        {/* Filtro de Recursos */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="p-2 bg-gray-100 rounded hover:bg-gray-200 flex items-center"
          >
           {config.filter_resources} {selectedResources.length > 0 && `(${selectedResources.length})`}
          </button>
          {filterOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-50 p-2">
              {resources.map((resource: Resource) => (
                <label key={resource.id} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    value={resource.id}
                    checked={selectedResources.includes(resource.id)}
                    onChange={handleResourceChange}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm">{resource.name}</span>
                </label>
              ))}
              <button
                onClick={() => {
                  setSelectedResources([]);
                  onResourceFilterChange([]);
                }}
                className="mt-2 text-xs text-red-500 hover:underline"
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
