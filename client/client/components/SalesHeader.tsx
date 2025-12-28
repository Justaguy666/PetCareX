import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, Package, ShoppingCart, FileText, User, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SalesHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { label: "Dashboard", path: "/sales", icon: LayoutDashboard },
        { label: "Inventory", path: "/sales/inventory", icon: Package },
        { label: "Sales Page", path: "/sales/sales-page", icon: ShoppingCart },
    ];

    const invoiceItems = [
        { label: "Service Invoices", path: "/sales/invoices/services" },
        { label: "Product Invoices", path: "/sales/invoice" },
    ];

    const isInvoiceActive = location.pathname.startsWith("/sales/invoice");

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-border">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link to="/sales" className="flex items-center gap-2 font-bold text-xl text-primary">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold">
                            🛒
                        </div>
                        <span className="hidden sm:inline">Sales Staff</span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link key={item.path} to={item.path}>
                                    <Button variant={isActive(item.path) ? "default" : "ghost"} className={`text-sm flex items-center gap-2 ${isActive(item.path) ? "bg-primary text-white" : "text-foreground hover:text-primary"}`}>
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                    </Button>
                                </Link>
                            );
                        })}

                        {/* Invoice Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant={isInvoiceActive ? "default" : "ghost"} className={`text-sm flex items-center gap-2 ${isInvoiceActive ? "bg-primary text-white" : "text-foreground hover:text-primary"}`}>
                                    <FileText className="w-4 h-4" />
                                    Invoices
                                    <ChevronDown className="w-3 h-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                {invoiceItems.map((item) => (
                                    <DropdownMenuItem key={item.path} asChild>
                                        <Link to={item.path} className="w-full cursor-pointer">
                                            {item.label}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* My Profile */}
                        <Link to="/sales/profile">
                            <Button variant={isActive("/sales/profile") ? "default" : "ghost"} className={`text-sm flex items-center gap-2 ${isActive("/sales/profile") ? "bg-primary text-white" : "text-foreground hover:text-primary"}`}>
                                <User className="w-4 h-4" />
                                My Profile
                            </Button>
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-medium text-foreground">{user?.fullName}</p>
                            <p className="text-xs text-muted-foreground">Sales Staff</p>
                        </div>

                        <Button onClick={handleLogout} variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <LogOut className="w-4 h-4" />
                        </Button>

                        <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
                            {isMenuOpen ? <X className="w-6 h-6 text-foreground" /> : <Menu className="w-6 h-6 text-foreground" />}
                        </button>
                    </div>
                </div>

                {isMenuOpen && (
                    <nav className="lg:hidden border-t border-border py-4 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}>
                                    <Button variant={isActive(item.path) ? "default" : "ghost"} className={`w-full justify-start flex items-center gap-2 ${isActive(item.path) ? "bg-primary text-white" : "text-foreground hover:text-primary"}`}>
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                    </Button>
                                </Link>
                            );
                        })}

                        {/* Invoices Section */}
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">Invoices</div>
                        {invoiceItems.map((item) => (
                            <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}>
                                <Button variant={isActive(item.path) ? "default" : "ghost"} className={`w-full justify-start flex items-center gap-2 ${isActive(item.path) ? "bg-primary text-white" : "text-foreground hover:text-primary"}`}>
                                    <FileText className="w-4 h-4" />
                                    {item.label}
                                </Button>
                            </Link>
                        ))}

                        {/* My Profile */}
                        <Link to="/sales/profile" onClick={() => setIsMenuOpen(false)}>
                            <Button variant={isActive("/sales/profile") ? "default" : "ghost"} className={`w-full justify-start flex items-center gap-2 ${isActive("/sales/profile") ? "bg-primary text-white" : "text-foreground hover:text-primary"}`}>
                                <User className="w-4 h-4" />
                                My Profile
                            </Button>
                        </Link>
                    </nav>
                )}
            </div>
        </header>
    );
}
