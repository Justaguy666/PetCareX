import VetHeader from "@/components/VetHeader";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, FileText, Bell, PawPrint, ClipboardList, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { apiGet } from "@/api/api";

export default function VetDashboard() {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const response = await apiGet('/dashboard/stats');
                setDashboardData(response?.data);
            } catch (error) {
                console.error('Failed to fetch vet stats:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (!user || user.role !== "veterinarian") {
        return <Navigate to="/login" />;
    }

    if (isLoading) {
        return <div className="p-8 text-center italic">Loading dashboard...</div>;
    }

    const stats = dashboardData?.stats || {
        todaysAppointments: 0,
        pendingRecords: 0,
        assignedPets: 0,
        unreadNotifications: 0
    };

    const recentActivity = dashboardData?.recentActivity || [];

    return (
        <div className="min-h-screen bg-background">
            <VetHeader />

            <main className="container mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg p-8 mb-8">
                    <h1 className="text-3xl font-bold mb-2">Welcome, Dr. {user.fullName}</h1>
                    <p className="text-blue-50 mb-4">Manage your appointments, medical records, and assigned pets</p>
                    <div className="flex gap-4">
                        <Link to="/vet/appointments-today">
                            <Button variant="secondary" size="lg">
                                Today's Appointments
                            </Button>
                        </Link>
                        <Link to="/vet/medical-records">
                            <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10">
                                Medical Records
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.todaysAppointments}</div>
                            <p className="text-xs text-muted-foreground">Scheduled for today</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Records</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pendingRecords}</div>
                            <p className="text-xs text-muted-foreground">Require attention</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Assigned Pets</CardTitle>
                            <PawPrint className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.assignedPets}</div>
                            <p className="text-xs text-muted-foreground">Under your care</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                            <Bell className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.unreadNotifications}</div>
                            <p className="text-xs text-muted-foreground">Unread messages</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link to="/vet/appointments-today">
                            <Button className="w-full h-20 flex flex-col items-center justify-center gap-2 bg-primary text-white">
                                <Calendar className="h-5 w-5" />
                                <span>View Appointments</span>
                            </Button>
                        </Link>
                        <Link to="/vet/medical-records">
                            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                                <FileText className="h-5 w-5" />
                                <span>Medical Records</span>
                            </Button>
                        </Link>
                        <Link to="/vet/assigned-pets">
                            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                                <PawPrint className="h-5 w-5" />
                                <span>Assigned Pets</span>
                            </Button>
                        </Link>
                        <Link to="/vet/notifications">
                            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                                <Bell className="h-5 w-5" />
                                <span>Notifications</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Recent Activity
                        </CardTitle>
                        <CardDescription>Your latest appointments and medical records</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.map((activity: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-4 border border-border rounded-lg">
                                    <div>
                                        <p className="font-medium">{activity.service_type} - {activity.pet_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(activity.time))}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${activity.status === 'Đã xác nhận' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {activity.status}
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
