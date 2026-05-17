import Sidebar from "./Sidebar";
import TitleBar from "./TitleBar";
import NotificationStack from "./ui/NotificationStack";
import { useSocket } from "@/hooks/useSocket";

export default function Layout({ children }) {
  useSocket();
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 bg-surface">
          {children}
        </main>
      </div>
      <NotificationStack />
    </div>
  );
}
