import React, { useState, useEffect, useRef } from "react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Download, Filter } from "lucide-react";
import { getLocale } from "../Utils/locate";
import { CalendarHeaderProps, Resource } from "../types/types";

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ 
  currentView,
  availableViews,
  onViewChange,
  currentDate,
  onNavigate,
  localeConfig, 
  onExport,
  exportOptions = [],
  headerLeftPlugins = [],
  headerRightPlugins = [],
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatTitle = () => {
    const locale = getLocale(localeConfig.lang);
    if (currentView === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, "d")} - ${format(end, "d MMM yyyy", { locale })}`;
    }
    if (currentView === "day") {
      return format(currentDate, "d MMMM yyyy", { locale });
    }
    return format(currentDate, "MMMM yyyy", { locale });
  };

  return (
    <div className="fc-header-toolbar fc-toolbar">
      <div className="fc-toolbar-chunk">
        <div className="fc-button-group">
          <button
            type="button"
            className="fc-prev-button fc-button fc-button-primary"
            onClick={() => onNavigate("prev")}
          >
            <ChevronLeft className="fc-icon" />
          </button>
          <button
            type="button"
            className="fc-next-button fc-button fc-button-primary"
            onClick={() => onNavigate("next")}
          >
            <ChevronRight className="fc-icon" />
          </button>
        </div>
        <div className="fc-button-group">
          <button
            type="button"
            className="fc-today-button fc-button fc-button-primary"
            onClick={() => onNavigate("today")}
          >
            {localeConfig?.today || "Today"}
          </button>
        </div>
        <h2 className="fc-toolbar-title">{formatTitle()}</h2>
      </div>

      <div className="fc-toolbar-chunk">
        {headerLeftPlugins.map((plugin, i) => (
          <div key={i} className="fc-plugin-left">{plugin}</div>
        ))}
      </div>

      <div className="fc-toolbar-chunk">
        <div className="fc-button-group">
          {availableViews.map((view) => (
            <button
              key={view.name}
              type="button"
              className={`fc-${view.name}-button fc-button fc-button-primary ${currentView === view.name ? "fc-button-active" : ""}`}
              onClick={() => onViewChange(view.name)}
            >
              {view.label}
            </button>
          ))}
        </div>

        {localeConfig?.export && exportOptions.length > 0 && onExport && (
          <div className="fc-export-container" ref={exportRef}>
            <button
              type="button"
              className="fc-export-button fc-button fc-button-primary"
              onClick={() => setIsExportOpen(!isExportOpen)}
              aria-haspopup="true"
              aria-expanded={isExportOpen}
            >
              <Download className="fc-icon" size={16} />
              <span>{localeConfig?.calendar_export || "Export"}</span>
            </button>
            {isExportOpen && (
              <div className="fc-export-menu">
                {exportOptions.map((opt) => (
                  <button
                    key={opt.formatName}
                    className="fc-export-option"
                    onClick={() => {
                      onExport(opt.formatName);
                      setIsExportOpen(false);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {headerRightPlugins.map((plugin, i) => (
          <div key={i} className="fc-plugin-right">{plugin}</div>
        ))}
      </div>
    </div>
  );
};

export default CalendarHeader;