import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, LayoutDashboard, Calendar, FileText, PawPrint, Bell, User, LogOut, Syringe, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function VetHeader() {
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
        { label: "Dashboard", path: "/vet", icon: LayoutDashboard },
        { label: "Today's Appointments", path: "/vet/appointments-today", icon: Calendar },
        { label: "Medical Records", path: "/vet/medical-records", icon: FileText },
        { label: "Assigned Pets", path: "/vet/assigned-pets", icon: PawPrint },
        { label: "Notifications", path: "/vet/notifications", icon: Bell },
        { label: "My Profile", path: "/vet/profile", icon: User },
    ];

    const injectionItems = [
        { label: "Single-Dose Injections", path: "/vet/injections/single" },
        { label: "Package Injections", path: "/vet/injections/package" },
    ];

    const isInjectionActive = location.pathname.startsWith("/vet/injections");

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-border">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link to="/vet" className="flex items-center gap-2 font-bold text-xl text-primary">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center text-white font-bold">
                            🩺
                        </div>
                        <span className="hidden sm:inline">Veterinarian</span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-2">
                        {navItems.slice(0, 4).map((item) => {
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

                        {/* Injection Services Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant={isInjectionActive ? "default" : "ghost"} className={`text-sm flex items-center gap-2 ${isInjectionActive ? "bg-primary text-white" : "text-foreground hover:text-primary"}`}>
                                    <Syringe className="w-4 h-4" />
                                    Injection Services
                                    <ChevronDown className="w-3 h-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                {injectionItems.map((item) => (
                                    <DropdownMenuItem key={item.path} asChild>
                                        <Link to={item.path} className="w-full cursor-pointer">
                                            {item.label}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {navItems.slice(4).map((item) => {
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
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-medium text-foreground">{user?.fullName}</p>
                            <p className="text-xs text-muted-foreground">Veterinarian</p>
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
                        {navItems.slice(0, 4).map((item) => {
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

                        {/* Injection Services Section */}
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">Injection Services</div>
                        {injectionItems.map((item) => (
                            <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}>
                                <Button variant={isActive(item.path) ? "default" : "ghost"} className={`w-full justify-start flex items-center gap-2 ${isActive(item.path) ? "bg-primary text-white" : "text-foreground hover:text-primary"}`}>
                                    <Syringe className="w-4 h-4" />
                                    {item.label}
                                </Button>
                            </Link>
                        ))}

                        {navItems.slice(4).map((item) => {
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
                    </nav>
                )}
            </div>
        </header>
    );
}
