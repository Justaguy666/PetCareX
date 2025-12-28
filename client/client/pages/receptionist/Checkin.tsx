import ReceptionHeader from "@/components/ReceptionHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CustomerCheckinTable from "@/components/receptionist/CustomerCheckinTable";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiGet, apiPut } from "@/api/api";

export default function Checkin() {
    const { user } = useAuth();
    if (!user || user.role !== 'receptionist') return <Navigate to="/login" />;

    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load appointments
    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                // TODO: consider filtering by branchId/date on server side
                const resp = await apiGet('/appointments');
                const data = resp?.data ?? resp ?? [];
                if (!mounted) return;
                setAppointments(Array.isArray(data) ? data : []);
            } catch (e: any) {
                console.error('Failed to load appointments', e);
                if (!mounted) return;
                setError(e?.message || 'Failed to load appointments');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const updateStatus = async (id: string, status: string) => {
        // TODO: Backend endpoint PUT /api/appointments/:id does not exist
        // This feature is disabled until backend implements appointment status update endpoint
        console.warn('Appointment status update is not available - backend endpoint missing');
        // Optionally show a toast notification
        // toast({ title: 'Feature Unavailable', description: 'Appointment status updates require backend support', variant: 'destructive' });
    };

    return (
        <div className="min-h-screen bg-background">
            <ReceptionHeader />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-3">Customer Check-in</h1>
                <p className="text-muted-foreground mb-6">Mark customer arrivals for today</p>

                <Card>
                    <CardHeader>
                        <CardTitle>Check-in Desk</CardTitle>
                        <CardDescription>View and process today's appointments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CustomerCheckinTable appointments={appointments} onUpdateStatus={updateStatus} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
