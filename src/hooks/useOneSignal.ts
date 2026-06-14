import { useState, useEffect } from 'react';

export type OneSignalState = "unconfigured" | "unsupported" | "loading" | "subscribed" | "unsubscribed" | "blocked";

export function useOneSignal() {
  const [status, setStatus] = useState<OneSignalState>("loading");

  useEffect(() => {
    const initOneSignal = async () => {
      const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
      
      console.info("OneSignal App ID config present:", !!appId);

      if (!appId) {
        setStatus("unconfigured");
        return;
      }


      const w = window as any;
      w.OneSignalDeferred = w.OneSignalDeferred || [];
      
      w.OneSignalDeferred.push(async function(OneSignal: any) {
        try {
          if (!OneSignal.initialized) {
            await OneSignal.init({
              appId,
              // notifyButton is removed to keep our custom UI clean
            });
          }

          // Check if push is supported
          if (!OneSignal.Notifications.isPushSupported()) {
            setStatus("unsupported");
            return;
          }

          const updateStatus = () => {
            const hasPermission = OneSignal.Notifications.permission;
            const isSubscribed = OneSignal.User.PushSubscription.optedIn;

            if (hasPermission === false) {
              // Denied/Blocked
              setStatus("blocked");
            } else if (isSubscribed) {
              setStatus("subscribed");
            } else {
              setStatus("unsubscribed");
            }
          };

          // Initial status
          updateStatus();

          // Listen for changes
          OneSignal.User.PushSubscription.addEventListener("change", updateStatus);
          OneSignal.Notifications.addEventListener("permissionChange", updateStatus);

        } catch (error) {
          console.error("Error initializing OneSignal", error);
          setStatus("unconfigured");
        }
      });
    };

    initOneSignal();
  }, []);

  const requestPermission = async () => {
    const w = window as any;
    if (w.OneSignal && status === "unsubscribed") {
      try {
        await w.OneSignal.Notifications.requestPermission();
      } catch (error) {
        console.error("Error requesting permission", error);
      }
    }
  };

  return { status, requestPermission };
}
