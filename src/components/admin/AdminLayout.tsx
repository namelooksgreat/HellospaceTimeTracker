import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AdminLayoutProps {
  children: React.ReactNode;
}

import { Outlet } from "react-router-dom";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="container max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in-50 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
