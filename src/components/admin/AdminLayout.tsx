import { Header } from "./Header";
import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export function AdminLayout() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-gradient-to-b from-background via-background/95 to-background/90">
      <Header />
      <main className="flex-1 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          <div className="page-transition-enter-active">
            <Outlet />
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
