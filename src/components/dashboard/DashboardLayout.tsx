import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Truck, 
  LayoutDashboard, 
  Package, 
  MapPin, 
  History, 
  User, 
  LogOut, 
  Menu,
  X,
  Bell,
  Search,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: "driver" | "shipper" | "admin";
  userName?: string;
}

const driverLinks = [
  { name: "Dashboard", path: "/driver/dashboard", icon: LayoutDashboard },
  { name: "Find Loads", path: "/driver/find-loads", icon: Search },
  { name: "Find Matches", path: "/driver/matches", icon: MapPin },
  { name: "My Vehicle", path: "/driver/my-vehicle", icon: Truck },
  { name: "Trip History", path: "/driver/trip-history", icon: History },
  { name: "Profile", path: "/driver/profile", icon: User },
];

const shipperLinks = [
  { name: "Dashboard", path: "/shipper/dashboard", icon: LayoutDashboard },
  { name: "Post Cargo", path: "/shipper/post-cargo", icon: Package },
  { name: "My Loads", path: "/shipper/my-loads", icon: MapPin },
  { name: "Load History", path: "/shipper/load-history", icon: History },
  { name: "Profile", path: "/shipper/profile", icon: User },
];

const adminLinks = [
  { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Users", path: "/admin/users", icon: User },
  { name: "All Loads", path: "/admin/loads", icon: Package },
  { name: "Vehicles", path: "/admin/vehicles", icon: Truck },
  { name: "Matches", path: "/admin/matches", icon: MapPin },
  { name: "Analytics", path: "/admin/analytics", icon: History },
];

const DashboardLayout = ({ children, userRole, userName = "User" }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const links = userRole === "driver" ? driverLinks : userRole === "shipper" ? shipperLinks : adminLinks;
  const roleColor = userRole === "driver" ? "secondary" : userRole === "shipper" ? "primary" : "accent";

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-xl bg-gradient-${roleColor === "secondary" ? "secondary" : "primary"} flex items-center justify-center`}>
                <Truck className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold">LoadLoop</span>
            </Link>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive(link.path)
                      ? `bg-${roleColor}/10 text-${roleColor}`
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full bg-${roleColor}/10 flex items-center justify-center`}>
                <User className={`w-5 h-5 text-${roleColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{userName}</div>
                <div className="text-xs text-muted-foreground capitalize">{userRole}</div>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 text-foreground"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden sm:flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="border-0 bg-transparent h-auto p-0 focus-visible:ring-0 w-48"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </button>
              <div className="flex items-center gap-2 cursor-pointer">
                <div className={`w-8 h-8 rounded-full bg-${roleColor}/10 flex items-center justify-center`}>
                  <User className={`w-4 h-4 text-${roleColor}`} />
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
