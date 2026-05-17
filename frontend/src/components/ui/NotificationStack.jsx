import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import clsx from "clsx";

const TYPE_STYLES = {
  success: "border-success/30 bg-success/10 text-success",
  error: "border-danger/30 bg-danger/10 text-danger",
  warning: "border-warning/30 bg-warning/10 text-warning",
  info: "border-accent/30 bg-accent/10 text-accent",
};

function Notification({ n, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(n.id), 4000);
    return () => clearTimeout(t);
  }, [n.id]);

  return (
    <div
      onClick={() => onDismiss(n.id)}
      className={clsx(
        "pointer-events-auto px-4 py-2.5 rounded-xl border text-sm font-medium cursor-pointer",
        "shadow-card backdrop-blur-sm animate-in slide-in-from-right-4 duration-200",
        TYPE_STYLES[n.type] || TYPE_STYLES.info
      )}
    >
      {n.msg}
    </div>
  );
}

export default function NotificationStack() {
  const notifications = useAppStore((s) => s.notifications);
  const dismiss = useAppStore((s) => s.dismissNotification);

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 pointer-events-none max-w-sm">
      {notifications.map((n) => (
        <Notification key={n.id} n={n} onDismiss={dismiss} />
      ))}
    </div>
  );
}
