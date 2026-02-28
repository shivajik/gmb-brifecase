import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";

export default function AdminLayout() {
  return (
    <AdminRouteGuard>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-14 flex items-center border-b border-border bg-background px-4">
              <SidebarTrigger className="mr-4" />
              <span className="text-sm font-medium text-muted-foreground">
                Content Management System
              </span>
            </header>
            <main className="flex-1 p-6 bg-muted/20">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminRouteGuard>
  );
}
