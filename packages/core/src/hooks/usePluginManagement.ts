// usePluginManagement.ts
import { useMemo } from "react";
import { CalendarPlugin, ViewPlugin, HeaderControlPlugin, DataSourcePlugin, EventRenderingPlugin, InteractionPlugin, ThemePlugin, ExportPlugin, CustomFilterPlugin } from '../types/plugins';

const usePluginManagement = (plugins: CalendarPlugin[]) => {
  const categorizedPlugins = useMemo(() => {
    const filterPlugins: HeaderControlPlugin[] = [];
    const searchPlugins: HeaderControlPlugin[] = [];
    const dataSourcePlugins: DataSourcePlugin[] = [];
    const customViewPlugins: ViewPlugin[] = [];
    const eventRenderingPlugins: EventRenderingPlugin[] = [];
    const interactionPlugins: InteractionPlugin[] = [];
    const themePlugins: ThemePlugin[] = [];
    const exportPlugins: ExportPlugin[] = [];
    const customFilterPlugins: CustomFilterPlugin[] = [];

    (plugins || []).forEach(plugin => {
      switch (plugin.type) {
        case 'filter':
          filterPlugins.push(plugin as HeaderControlPlugin);
          break;
        case 'search':
          searchPlugins.push(plugin as HeaderControlPlugin);
          break;
        case 'data-source':
          dataSourcePlugins.push(plugin as DataSourcePlugin);
          break;
        case 'view':
          customViewPlugins.push(plugin as ViewPlugin);
          break;
        case 'event-rendering':
          eventRenderingPlugins.push(plugin as EventRenderingPlugin);
          break;
        case 'interaction':
          interactionPlugins.push(plugin as InteractionPlugin);
          break;
        case 'theme':
          themePlugins.push(plugin as ThemePlugin);
          break;
        case 'export':
          exportPlugins.push(plugin as ExportPlugin);
          break;
        case 'custom-filter':
          customFilterPlugins.push(plugin as CustomFilterPlugin);
          break;
        default:
          // console.warn(`Unknown plugin type: ${(plugin as any).type}`);
      }
    });

    return { filterPlugins, searchPlugins, dataSourcePlugins, customViewPlugins, eventRenderingPlugins, interactionPlugins, themePlugins, exportPlugins, customFilterPlugins };
  }, [plugins]);

  return categorizedPlugins;
};

export default usePluginManagement;
