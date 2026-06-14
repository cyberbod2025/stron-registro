import { useState, useEffect } from 'react';

export type OneSignalState = "unconfigured" | "unsupported" | "loading" | "subscribed" | "unsubscribed" | "blocked" | "error";

export function useOneSignal() {
  const [status, setStatus] = useState<OneSignalState>("loading");

  useEffect(() => {
    const initOneSignal = async () => {
      const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
      
      console.info("[OneSignal Diag] App ID present:", !!appId);
      if (appId) console.info("[OneSignal Diag] App ID length:", appId.length);
      console.info("[OneSignal Diag] window.OneSignal exists:", !!(window as any).OneSignal);
      console.info("[OneSignal Diag] Notification API supported:", 'Notification' in window);
      console.info("[OneSignal Diag] Notification.permission:", 'Notification' in window ? Notification.permission : 'N/A');

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
            console.warn("[OneSignal Diag] Push not supported");
            setStatus("unsupported");
            return;
          }

          const updateStatus = () => {
            const hasPermission = OneSignal.Notifications.permission;
            const isSubscribed = OneSignal.User.PushSubscription.optedIn;

            console.info("[OneSignal Diag] updateStatus() -> hasPermission:", hasPermission, "isSubscribed:", isSubscribed);

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
          console.error("[OneSignal Diag] Error initializing OneSignal", error);
          setStatus("error");
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
        console.error("[OneSignal Diag] Error requesting permission", error);
        setStatus("error");
      }
    }
  };

  return { status, requestPermission };
}
