import { useMemo } from "react";
import { CalendarPlugin } from "../types/plugns";

const usePluginManagement = (plugins: CalendarPlugin[]) => {
  const filterPlugins = useMemo(
    () => plugins.filter((plugin) => plugin.type === "filter"),
    [plugins]
  );
  const searchPlugins = useMemo(
    () => plugins.filter((plugin) => plugin.type === "search"),
    [plugins]
  );
  const dataSourcePlugins = useMemo(
    () => plugins.filter((plugin) => plugin.type === "dataSource"),
    [plugins]
  );
  const customViewPlugins = useMemo(
    () => plugins.filter((plugin) => plugin.location === "view"),
    [plugins]
  );

  return { filterPlugins, searchPlugins, dataSourcePlugins, customViewPlugins };
};

export default usePluginManagement;
