import { useEffect, useRef } from "react";

const STORAGE_KEY = "lvl_visitor_id";

function getVisitorId(): string {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export function useTrackVisit(path: string = window.location.pathname) {
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    const sessionFlag = `lvl_tracked_${path}`;
    if (sessionStorage.getItem(sessionFlag)) return;
    sessionStorage.setItem(sessionFlag, "1");
    tracked.current = true;

    const visitor_id = getVisitorId();
    fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path,
        visitor_id,
        user_agent: navigator.userAgent.slice(0, 500),
        referrer: document.referrer.slice(0, 500) || null,
      }),
    }).catch(() => {});
  }, [path]);
}
