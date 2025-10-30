import React from 'react';
import { format, isToday } from 'date-fns';
import { getLocale } from '../../../Utils/locate';

interface DayColumnHeaderProps {
    dayDate: Date;
    config: any;
}

export const DayColumnHeader: React.FC<DayColumnHeaderProps> = ({ dayDate, config }) => {
  const locale = getLocale(config?.lang || 'en');
  const isCurrentDay = isToday(dayDate);

  const headerClass = `react-agenfy-daycolumn-header ${isCurrentDay ? 'react-agenfy-daycolumn-header-today' : ''}`;
  
  return (
    <div className={headerClass}>
      <div className="react-agenfy-daycolumn-header-text">
        <div className="react-agenfy-daycolumn-weekday">
          {format(dayDate, 'EEE', { locale })}
        </div>
        <div className="react-agenfy-daycolumn-date">
          {format(dayDate, 'd', { locale })}
        </div>
      </div>
    </div>
  );
};