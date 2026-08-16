import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || import.meta.env.DEV) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/service-worker.js").catch((error) => {
        console.warn("ahaar service worker registration failed", error);
      });
    });
  }, []);

  return null;
}
