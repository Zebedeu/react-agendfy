import { useEffect } from "react";

const useNotificationPermission = (enabled: boolean) => {
  useEffect(() => {
    if (enabled && "Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, [enabled]);
};

export default useNotificationPermission;
