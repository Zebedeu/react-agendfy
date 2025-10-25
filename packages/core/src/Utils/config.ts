import { CalendarConfig, LocaleConfig } from "../types";

  export const getLocaleConfig = (lang: string): LocaleConfig => {
    if (lang === 'pt') {
      return {
        today: 'Hoje',
        monthView: 'Mês',
        weekView: 'Semana',
        dayView: 'Dia',
      };
    } else {
      return {
        today: 'Today',
        monthView: 'Month',
        weekView: 'Week',
        dayView: 'Day',
      };
    }
  };

 export  const config: CalendarConfig = {
    defaultView: "month",
    slotDuration: 15,
    slotLabelFormat: "HH:mm",
    slotMin: "00:00",
    slotMax: "24:00",
    lang: 'pt',
    today: 'Today',
    monthView: 'Month',
    weekView: 'Week',
    dayView: 'Day',
    businessHours: {
      enabled: true,
      intervals: [
        { daysOfWeek: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "17:00" }
      ]
    },
    alerts: {
      enabled: true,          
      thresholdMinutes: 15,  
    },
  };
