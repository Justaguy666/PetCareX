import ReceptionHeader from "@/components/ReceptionHeader";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, UserPlus, Search, CreditCard, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { apiGet } from "@/api/api";

export default function ReceptionDashboard() {
    const { user } = useAuth();
    if (!user || user.role !== "receptionist") return <Navigate to="/login" />;

    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const resp = await apiGet('/dashboard/stats');
                if (mounted) {
                    setDashboardData(resp?.data);
                }
            } catch (e: any) {
                console.error('Failed to load dashboard counts', e);
                if (mounted) setError(e?.message || 'Failed to load data');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const stats = dashboardData?.stats || {
        todaysAppointments: 0,
        pendingCheckins: 0,
        totalCustomers: 0,
        invoicesToday: 0
    };

    const recentActivity = dashboardData?.recentActivity || [];

    return (
        <div className="min-h-screen bg-background">
            <ReceptionHeader />

            <main className="container mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg p-8 mb-8">
                    <h1 className="text-3xl font-bold mb-2">Welcome, {user.fullName}</h1>
                    <p className="text-blue-50 mb-4">Manage appointments, check-ins, and customer billing</p>
                    <div className="flex gap-4">
                        <Link to="/receptionist/booking">
                            <Button variant="secondary" size="lg">
                                New Booking
                            </Button>
                        </Link>
                        <Link to="/receptionist/checkin">
                            <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10">
                                Check-in Desk
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? '...' : stats.todaysAppointments}</div>
                            <p className="text-xs text-muted-foreground">Scheduled bookings</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Pending Check-ins</CardTitle>
                            <UserPlus className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? '...' : stats.pendingCheckins}</div>
                            <p className="text-xs text-muted-foreground">Waiting customers</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                            <Search className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? '...' : stats.totalCustomers}</div>
                            <p className="text-xs text-muted-foreground">In database</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Invoices Today</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? '...' : stats.invoicesToday}</div>
                            <p className="text-xs text-muted-foreground">Processed today</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common reception tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Link to="/receptionist/booking">
                                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    <span>Book Appointment</span>
                                </Button>
                            </Link>
                            <Link to="/receptionist/checkin">
                                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                                    <UserPlus className="h-5 w-5" />
                                    <span>Check-in Customer</span>
                                </Button>
                            </Link>
                            <Link to="/receptionist/pet-lookup">
                                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                                    <Search className="h-5 w-5" />
                                    <span>Pet Lookup</span>
                                </Button>
                            </Link>
                            <Link to="/receptionist/billing">
                                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    <span>Create Invoice</span>
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest reception desk activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.map((activity: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-4 p-3 border rounded-lg">
                                    <Activity className="h-5 w-5 text-muted-foreground" />
                                    <div className="flex-1">
                                        <p className="font-medium">{activity.customer_name} - {activity.pet_name}</p>
                                        <p className="text-sm text-muted-foreground">{activity.status}</p>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {new Intl.DateTimeFormat('vi-VN', { timeStyle: 'short' }).format(new Date(activity.time))}
                                    </span>
                                </div>
                            ))}
                            {recentActivity.length === 0 && (
                                <p className="text-center py-4 text-muted-foreground italic">No recent activity</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
