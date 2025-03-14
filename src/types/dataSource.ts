import { FC, ReactNode } from 'react';
import { Config, EventProps } from '../types';

export interface DataSourcePlugin {
  type: 'dataSource';
  name: string; 
  fetchEvents: (startDate: Date, endDate: Date, config: Config) => Promise<EventProps[]>;
  component?: FC<DataSourceConfigProps>;
}

export interface DataSourceConfigProps {
  onConfigChange: (config: any) => void;
  initialConfig?: any;
}
