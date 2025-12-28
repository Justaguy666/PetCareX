import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Menu, X, LogOut, UserCircle, LayoutDashboard, Building2,
  Package, Tag, Users, History, Stethoscope, Syringe,
  Boxes, Percent, FileText, Receipt, ChevronDown, ChevronRight,
  Calendar, Pill, ShoppingCart, BarChart3, PackageOpen
} from "lucide-react";
import { useState } from "react";

export default function AdminHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    "branch", "staff", "service", "inventory", "stock", "operations"
  ]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;
  const isGroupActive = (paths: string[]) => paths.some(path => location.pathname === path);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const navStructure = [
    {
      type: "single" as const,
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      type: "group" as const,
      id: "branch",
      label: "Branch Management",
      icon: Building2,
      items: [
        { label: "Branches", path: "/admin/branches", icon: Building2 },
        { label: "Branch Inventory", path: "/admin/branch-inventory", icon: Package },
        { label: "Branch Promotions", path: "/admin/branch-promotions", icon: Tag },
      ]
    },
    {
      type: "group" as const,
      id: "staff",
      label: "Staff Management",
      icon: Users,
      items: [
        { label: "Staff List", path: "/admin/staff", icon: Users },
        { label: "Transfer History", path: "/admin/transfer-history", icon: History },
      ]
    },
    {
      type: "group" as const,
      id: "service",
      label: "Service System",
      icon: Stethoscope,
      items: [
        { label: "Service Types", path: "/admin/service-types", icon: Stethoscope },
        { label: "Vaccines", path: "/admin/vaccines", icon: Syringe },
        { label: "Vaccine Packages", path: "/admin/vaccine-packages", icon: Boxes },
        { label: "Global Promotions", path: "/admin/promotions", icon: Percent },
      ]
    },
    {
      type: "group" as const,
      id: "inventory",
      label: "Inventory & Products",
      icon: ShoppingCart,
      items: [
        { label: "Products", path: "/admin/products", icon: ShoppingCart },
        { label: "Medications", path: "/admin/medications", icon: Pill },
      ]
    },
    {
      type: "group" as const,
      id: "stock",
      label: "Inventory Stock",
      icon: PackageOpen,
      items: [
        { label: "Product Stock", path: "/admin/inventory/products", icon: Package },
        { label: "Vaccine Stock", path: "/admin/inventory/vaccines", icon: Syringe },
      ]
    },
    {
      type: "group" as const,
      id: "operations",
      label: "Operations",
      icon: FileText,
      items: [
        { label: "Appointments", path: "/admin/appointments", icon: Calendar },
        { label: "Medical Records", path: "/admin/medical-records", icon: FileText },
        { label: "Invoices", path: "/admin/invoices", icon: Receipt },
        { label: "Customers", path: "/admin/customers", icon: Users },
        { label: "Rating Analytics", path: "/admin/analytics/ratings", icon: BarChart3 },
      ]
    },
    {
      type: "single" as const,
      label: "My Profile",
      path: "/admin/profile",
      icon: UserCircle,
    },
  ];

  return (
    <>
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-border z-40">
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border">
          <Link to="/admin/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold">
              🐾
            </div>
            <span>Admin Panel</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="h-[calc(100vh-8rem)] overflow-y-auto py-4 px-3 space-y-1">
          {navStructure.map((item, idx) => {
            if (item.type === "single") {
              const Icon = item.icon;
              return (
                <Link key={idx} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className={`w-full justify-start ${isActive(item.path)
                      ? "bg-primary text-white"
                      : "text-foreground hover:text-primary hover:bg-primary/5"
                      }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            } else {
              const Icon = item.icon;
              const isExpanded = expandedGroups.includes(item.id);
              const isThisGroupActive = isGroupActive(item.items.map(i => i.path));

              return (
                <div key={idx}>
                  <button
                    onClick={() => toggleGroup(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${isThisGroupActive
                      ? "text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-gray-100"
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.items.map((subItem, subIdx) => {
                        const SubIcon = subItem.icon;
                        return (
                          <Link key={subIdx} to={subItem.path}>
                            <Button
                              variant={isActive(subItem.path) ? "default" : "ghost"}
                              size="sm"
                              className={`w-full justify-start ${isActive(subItem.path)
                                ? "bg-primary text-white"
                                : "text-foreground hover:text-primary hover:bg-primary/5"
                                }`}
                            >
                              <SubIcon className="w-4 h-4 mr-2" />
                              {subItem.label}
                            </Button>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
          })}
        </nav>

        {/* User Info and Logout */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4 space-y-2 bg-white">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground capitalize">Branch Manager</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-border">
        <div className="flex items-center justify-between h-16 px-4">
          <Link to="/admin/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold">
              🐾
            </div>
            <span>Admin</span>
          </Link>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            className="p-2"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t border-border bg-white max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="py-4 px-3 space-y-1">
              {navStructure.map((item, idx) => {
                if (item.type === "single") {
                  const Icon = item.icon;
                  return (
                    <Link key={idx} to={item.path} onClick={() => setIsMenuOpen(false)}>
                      <Button
                        variant={isActive(item.path) ? "default" : "ghost"}
                        className={`w-full justify-start ${isActive(item.path)
                          ? "bg-primary text-white"
                          : "text-foreground hover:text-primary"
                          }`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                } else {
                  const Icon = item.icon;
                  const isExpanded = expandedGroups.includes(item.id);

                  return (
                    <div key={idx}>
                      <button
                        onClick={() => toggleGroup(item.id)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-100"
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.items.map((subItem, subIdx) => {
                            const SubIcon = subItem.icon;
                            return (
                              <Link
                                key={subIdx}
                                to={subItem.path}
                                onClick={() => setIsMenuOpen(false)}
                              >
                                <Button
                                  variant={isActive(subItem.path) ? "default" : "ghost"}
                                  size="sm"
                                  className={`w-full justify-start ${isActive(subItem.path)
                                    ? "bg-primary text-white"
                                    : "text-foreground hover:text-primary"
                                    }`}
                                >
                                  <SubIcon className="w-4 h-4 mr-2" />
                                  {subItem.label}
                                </Button>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
              })}
            </nav>

            <div className="border-t border-border p-4">
              <Button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
