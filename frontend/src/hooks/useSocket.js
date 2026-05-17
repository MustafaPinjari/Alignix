import { useEffect } from "react";
import { io } from "socket.io-client";
import { useAppStore } from "@/store/appStore";

let socket = null;

export function useSocket() {
  const { addMonitorEvent, notify, setBatchProgress, setBatchResults, setBatchRunning } = useAppStore();

  useEffect(() => {
    if (socket) return;
    socket = io("http://127.0.0.1:5000", { transports: ["websocket"] });

    socket.on("monitor:corrected", (data) => {
      addMonitorEvent({ type: "corrected", ...data, ts: new Date().toISOString() });
      notify(`Auto-corrected ${data.changes} issues`, "success");
    });

    socket.on("monitor:clean", (data) => {
      addMonitorEvent({ type: "clean", ...data, ts: new Date().toISOString() });
    });

    socket.on("batch:progress", (data) => {
      setBatchProgress(data);
    });

    socket.on("batch:complete", (data) => {
      setBatchRunning(false);
      setBatchResults(data.results || []);
      notify(`Batch complete — ${data.succeeded}/${data.total} succeeded`, "success");
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, []);

  return socket;
}
