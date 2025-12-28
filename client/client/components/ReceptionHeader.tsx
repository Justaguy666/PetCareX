import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, LayoutDashboard, Calendar, UserPlus, Search, CreditCard, User, LogOut, Syringe, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ReceptionHeader() {
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
        { label: "Dashboard", path: "/receptionist", icon: LayoutDashboard },
        { label: "Customer Check-in", path: "/receptionist/checkin", icon: UserPlus },
        { label: "Pet Lookup", path: "/receptionist/pet-lookup", icon: Search },
        { label: "Billing", path: "/receptionist/billing", icon: CreditCard },
        { label: "My Profile", path: "/receptionist/profile", icon: User },
    ];

    const appointmentItems = [
        { label: "General Appointments", path: "/receptionist/booking" },
        { label: "Injection Appointments", path: "/receptionist/appointments/injections" },
    ];

    const isAppointmentActive = location.pathname.startsWith("/receptionist/booking") || location.pathname.startsWith("/receptionist/appointments");

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-border">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link to="/receptionist" className="flex items-center gap-2 font-bold text-xl text-primary">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center text-white font-bold">
                            🎫
                        </div>
                        <span className="hidden sm:inline">Reception</span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-2">
                        {/* Dashboard */}
                        <Link to={navItems[0].path}>
                            <Button variant={isActive(navItems[0].path) ? "default" : "ghost"} className={`text-sm flex items-center gap-2 ${isActive(navItems[0].path) ? "bg-primary text-white" : "text-foreground hover:text-primary"}`}>
                                <LayoutDashboard className="w-4 h-4" />
                                {navItems[0].label}
                            </Button>
                        </Link>

                        {/* Appointment Booking Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant={isAppointmentActive ? "default" : "ghost"} className={`text-sm flex items-center gap-2 ${isAppointmentActive ? "bg-primary text-white" : "text-foreground hover:text-primary"}`}>
                                    <Calendar className="w-4 h-4" />
                                    Appointment Booking
                                    <ChevronDown className="w-3 h-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                {appointmentItems.map((item) => (
                                    <DropdownMenuItem key={item.path} asChild>
                                        <Link to={item.path} className="w-full cursor-pointer">
                                            {item.label}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Rest of nav items */}
                        {navItems.slice(1).map((item) => {
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
                            <p className="text-xs text-muted-foreground">Receptionist</p>
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
                        {/* Dashboard */}
                        <Link to={navItems[0].path} onClick={() => setIsMenuOpen(false)}>
                            <Button variant={isActive(navItems[0].path) ? "default" : "ghost"} className={`w-full justify-start flex items-center gap-2 ${isActive(navItems[0].path) ? "bg-primary text-white" : "text-foreground hover:text-primary"}`}>
                                <LayoutDashboard className="w-4 h-4" />
                                {navItems[0].label}
                            </Button>
                        </Link>

                        {/* Appointment Booking Section */}
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">Appointment Booking</div>
                        {appointmentItems.map((item) => (
                            <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}>
                                <Button variant={isActive(item.path) ? "default" : "ghost"} className={`w-full justify-start flex items-center gap-2 ${isActive(item.path) ? "bg-primary text-white" : "text-foreground hover:text-primary"}`}>
                                    <Calendar className="w-4 h-4" />
                                    {item.label}
                                </Button>
                            </Link>
                        ))}

                        {/* Rest of nav items */}
                        {navItems.slice(1).map((item) => {
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
