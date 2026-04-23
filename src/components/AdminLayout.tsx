import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  Building,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard, minRole: "VIEWER" },
  { name: "Portföyler", path: "/admin/portfolios", icon: Building2, minRole: "AGENT" },
  { name: "İşlemler", path: "/admin/transactions", icon: ClipboardList, minRole: "AGENT" },
  { name: "Müşteriler", path: "/admin/customers", icon: Users, minRole: "AGENT" },
  { name: "Belgeler", path: "/admin/documents", icon: FileText, minRole: "AGENT" },
  { name: "Raporlar", path: "/admin/reports", icon: BarChart3, minRole: "MANAGER" },
  { name: "Ayarlar", path: "/admin/settings", icon: Settings, minRole: "ADMIN" },
];

const ROLE_HIERARCHY: Record<string, number> = {
  VIEWER: 1,
  AGENT: 2,
  MANAGER: 3,
  ADMIN: 4,
};

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const userLevel = ROLE_HIERARCHY[user?.role ?? "VIEWER"] ?? 0;

  const visibleNav = navItems.filter(
    (item) => userLevel >= (ROLE_HIERARCHY[item.minRole] ?? 0)
  );

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-4">
        <Building className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">Arsarazi</span>
      </div>
      <Separator />
      <ScrollArea className="flex-1 py-2">
        <nav className="flex flex-col gap-1 px-2">
          {visibleNav.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
                {active && <ChevronRight className="ml-auto h-4 w-4" />}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
            {user?.name?.[0] ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Çıkış Yap
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-card">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden absolute top-4 left-4 z-50">
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <NavContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden h-14 border-b flex items-center px-4 gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <span className="font-bold">Arsarazi</span>
        </header>
        <ScrollArea className="flex-1 p-4 lg:p-6">
          <Outlet />
        </ScrollArea>
      </main>
    </div>
  );
}
