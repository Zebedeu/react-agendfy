import { useState, useEffect, useRef } from "react";
import { getLocale } from "../Utils/locate";

const useLocaleConfig = (config: any, defaultConfig: any) => {
  const [localeConfig, setLocaleConfig] = useState(() => {
    const finalConfig = { ...defaultConfig, ...config };
    return { ...finalConfig, ...getLocale(finalConfig.lang) };
  });

  const lastRelevantConfigRef = useRef(config);

  useEffect(() => {
    if (config && typeof config === "object") {
      const isRelevantChange =
        !lastRelevantConfigRef.current ||
        config.lang !== lastRelevantConfigRef.current.lang ||
        config.defaultView !== lastRelevantConfigRef.current.defaultView;
      if (isRelevantChange) {
        setLocaleConfig((prevConfig: any) => ({
          ...prevConfig,
          ...config,
          ...getLocale(config.lang || prevConfig.lang),
        }));
        lastRelevantConfigRef.current = config;
      }
    }
  }, [config]);

  return [localeConfig, setLocaleConfig] as const;
};

export default useLocaleConfig;
