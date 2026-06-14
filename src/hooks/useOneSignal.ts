import { useState, useEffect } from 'react';

declare global {
  interface Window {
    __oneSignalInitialized?: boolean;
    OneSignalDeferred?: any[];
    OneSignal?: any;
  }
}

export type OneSignalState = "unconfigured" | "unsupported" | "loading" | "subscribed" | "unsubscribed" | "blocked" | "error";

export interface OneSignalDebugInfo {
  appIdDetected: boolean;
  appIdLength: number;
  notificationApi: boolean;
  notificationPermission: string;
  serviceWorker: boolean;
  oneSignalSdk: boolean;
  errorMessage?: string;
}

export function useOneSignal() {
  const [status, setStatus] = useState<OneSignalState>("loading");
  const [debugInfo, setDebugInfo] = useState<OneSignalDebugInfo>({
    appIdDetected: false,
    appIdLength: 0,
    notificationApi: false,
    notificationPermission: 'N/A',
    serviceWorker: false,
    oneSignalSdk: false
  });

  useEffect(() => {
    const initOneSignal = async () => {
      const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
      
      const debug = {
        appIdDetected: !!appId,
        appIdLength: appId ? appId.length : 0,
        notificationApi: 'Notification' in window,
        notificationPermission: 'Notification' in window ? Notification.permission : 'N/A',
        serviceWorker: 'serviceWorker' in navigator,
        oneSignalSdk: !!(window as any).OneSignal
      };
      
      setDebugInfo(debug);

      console.info("[OneSignal Diag] App ID present:", debug.appIdDetected);
      if (appId) console.info("[OneSignal Diag] App ID length:", debug.appIdLength);
      console.info("[OneSignal Diag] window.OneSignal exists:", debug.oneSignalSdk);
      console.info("[OneSignal Diag] Notification API supported:", debug.notificationApi);
      console.info("[OneSignal Diag] Notification.permission:", debug.notificationPermission);

      if (!appId) {
        setStatus("unconfigured");
        return;
      }


      const w = window as any;
      w.OneSignalDeferred = w.OneSignalDeferred || [];
      
      w.OneSignalDeferred.push(async function(OneSignal: any) {
        try {
          if (window.__oneSignalInitialized) {
            console.info("[OneSignal Diag] SDK ya estaba inicializado globalmente.");
          } else {
            try {
              if (!OneSignal.initialized && !OneSignal.config?.appId) {
                await OneSignal.init({ appId });
              }
              window.__oneSignalInitialized = true;
            } catch (initErr: any) {
              const msg = initErr?.message || "";
              if (msg.includes("already initialized")) {
                console.warn("[OneSignal Diag] SDK was already initialized, proceeding safely.");
                window.__oneSignalInitialized = true;
              } else if (msg.includes("Can only be used on:")) {
                console.warn("[OneSignal Diag] Domain mismatch. OneSignal is disabled in this environment.");
                setStatus("unsupported");
                return;
              } else {
                throw initErr;
              }
            }
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

        } catch (error: any) {
          console.error("[OneSignal Diag] Error initializing OneSignal", error);
          setDebugInfo(prev => ({ ...prev, errorMessage: error?.message || String(error) }));
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
      } catch (error: any) {
        console.error("[OneSignal Diag] Error requesting permission", error);
        setDebugInfo(prev => ({ ...prev, errorMessage: error?.message || String(error) }));
        setStatus("error");
      }
    }
  };

  return { status, requestPermission, debugInfo };
}
