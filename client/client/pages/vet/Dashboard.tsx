import VetHeader from "@/components/VetHeader";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, FileText, PawPrint, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { apiGet, apiPut } from "@/api/api";
import { useToast } from "@/hooks/use-toast";

export default function VetDashboard() {
    const { user } = useAuth();
    const { toast } = useToast();
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
                <div className="flex flex-col md:flex-row justify-center gap-6 mb-8 px-4">
                    <Card className="w-full md:w-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.todaysAppointments}</div>
                            <p className="text-xs text-muted-foreground">Scheduled for today</p>
                        </CardContent>
                    </Card>

                    <Card className="w-full md:w-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Records</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pendingRecords}</div>
                            <p className="text-xs text-muted-foreground">Require attention</p>
                        </CardContent>
                    </Card>

                    <Card className="w-full md:w-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Assigned Pets</CardTitle>
                            <PawPrint className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.assignedPets}</div>
                            <p className="text-xs text-muted-foreground">Under your care</p>
                        </CardContent>
                    </Card>

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
                                    <div className="flex items-center gap-2">
                                        {activity.status === 'Đang chờ xác nhận' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    onClick={async () => {
                                                        try {
                                                            await apiPut(`/doctor/appointments/${activity.id}/confirm`);
                                                            toast({ title: 'Đã xác nhận', description: 'Lịch hẹn đã được xác nhận.' });
                                                            const response = await apiGet('/dashboard/stats');
                                                            setDashboardData(response?.data);
                                                        } catch (error) {
                                                            toast({ title: 'Lỗi', description: 'Không thể xác nhận lịch hẹn.', variant: 'destructive' });
                                                        }
                                                    }}
                                                >
                                                    Xác nhận
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={async () => {
                                                        try {
                                                            await apiPut(`/doctor/appointments/${activity.id}/cancel`, { reason: 'Bác sĩ hủy' });
                                                            toast({ title: 'Đã hủy', description: 'Lịch hẹn đã được hủy.' });
                                                            const response = await apiGet('/dashboard/stats');
                                                            setDashboardData(response?.data);
                                                        } catch (error) {
                                                            toast({ title: 'Lỗi', description: 'Không thể hủy lịch hẹn.', variant: 'destructive' });
                                                        }
                                                    }}
                                                >
                                                    Hủy
                                                </Button>
                                            </>
                                        )}
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                            activity.status === 'Đã xác nhận' ? 'bg-green-100 text-green-700' : 
                                            activity.status === 'Hủy bỏ' ? 'bg-red-100 text-red-700' : 
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {activity.status}
                                        </span>
                                    </div>
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
