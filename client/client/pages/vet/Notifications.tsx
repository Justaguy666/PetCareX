import VetHeader from "@/components/VetHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Bell, Calendar, AlertCircle, MessageSquare } from "lucide-react";

const sampleNotifications = [
    { id: 'n-1', type: 'Appointment', title: 'New appointment booked', message: 'Bella scheduled for 09:00 AM tomorrow', time: '2 hours ago', icon: Calendar, color: 'blue' },
    { id: 'n-2', type: 'Feedback', title: 'Customer feedback received', message: 'Mary left 5-star review for Max\'s checkup', time: '5 hours ago', icon: MessageSquare, color: 'green' },
    { id: 'n-3', type: 'Alert', title: 'Medication low stock', message: 'Amoxicillin below minimum threshold', time: '1 day ago', icon: AlertCircle, color: 'orange' },
    { id: 'n-4', type: 'System', title: 'System maintenance', message: 'Scheduled maintenance tonight at 11 PM', time: '1 day ago', icon: Bell, color: 'purple' },
];

export default function Notifications() {
    const { user } = useAuth();
    if (!user || user.role !== 'veterinarian') return <Navigate to="/login" />;

    return (
        <div className="min-h-screen bg-background">
            <VetHeader />
            <main className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Notifications</h1>
                    <p className="text-muted-foreground">Recent appointments, feedback and system alerts</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Notifications</CardTitle>
                        <CardDescription>Stay updated with important information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {sampleNotifications.map((notification) => {
                                const Icon = notification.icon;
                                const colorClasses = {
                                    blue: 'bg-blue-100 text-blue-600',
                                    green: 'bg-green-100 text-green-600',
                                    orange: 'bg-orange-100 text-orange-600',
                                    purple: 'bg-purple-100 text-purple-600',
                                }[notification.color];

                                return (
                                    <div key={notification.id} className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-start justify-between">
                                                <h3 className="font-medium">{notification.title}</h3>
                                                <span className="text-xs text-muted-foreground">{notification.time}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                                            <Badge variant="outline" className="text-xs">{notification.type}</Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
