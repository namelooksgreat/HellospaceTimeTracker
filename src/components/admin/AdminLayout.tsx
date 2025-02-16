import { Header } from "./Header";
import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export function AdminLayout() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-gradient-to-b from-background via-background/95 to-background/90">
      <Header />
      <BottomNav />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="container max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in-50 duration-500">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
