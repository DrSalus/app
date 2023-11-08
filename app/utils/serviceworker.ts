import { useEffect, useState } from "react";

export async function registerServiceWorker() {
  window.SERVICE_WORKER_ACTIVE = false;
  console.log("Register service worker....");
  return navigator.serviceWorker.register("/scorm.js").then((res) => {
    console.log(res.active?.state);
    window.SERVICE_WORKER_ACTIVE = res.active?.state === "activated";
  });
}

export function useServiceWorkerActive(): boolean {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setActive(window.SERVICE_WORKER_ACTIVE);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return active;
}
