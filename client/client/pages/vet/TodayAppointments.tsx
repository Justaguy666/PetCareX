import VetHeader from "@/components/VetHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPut } from "@/api/api";
import { toBackendStatus } from "@/lib/apiUtils";
import { Syringe, Package } from "lucide-react";

interface Appointment {
    id: string;
    time: string;
    petId?: string;
    petName: string;
    owner: string;
    reason: string;
    status: string;
}

export default function TodayAppointments() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    // Fetch today's appointments from backend for this doctor
    useEffect(() => {
        let mounted = true;
        const fetchToday = async () => {
            try {
                const body = await apiGet('/doctor/today-appointments');
                const rows = body?.data ?? [];

                const mapped = (rows as any[]).map(r => ({
                    id: String(r.id),
                    time: r.appointmentTime ? new Date(r.appointmentTime).toTimeString().slice(0, 5) : '',
                    petId: r.petId ? String(r.petId) : undefined,
                    petName: r.petName || 'Unknown',
                    owner: r.ownerName || 'Unknown',
                    reason: r.reason || '',
                    status: r.status || 'Scheduled',
                })) as Appointment[];

                if (mounted) setAppointments(mapped);
            } catch (err) {
                console.error('Failed to fetch today appointments', err);
                setAppointments([]);
            }
        };
        fetchToday();
        return () => { mounted = false; };
    }, [user]);

    if (!user || user.role !== 'veterinarian') return <Navigate to="/login" />;

    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const handleComplete = async (id: string) => {
        // TODO: Backend endpoint PUT /api/appointments/:id does not exist
        // This feature is disabled until backend implements appointment status update endpoint
        setUpdatingId(id);
        try {
            // Attempt to call endpoint (will fail gracefully)
            const backendStatus = toBackendStatus('Completed');
            await apiPut(`/appointments/${id}`, { status: backendStatus });
            setAppointments(prevAppointments =>
                prevAppointments.map(apt =>
                    apt.id === id ? { ...apt, status: 'Completed' } : apt
                )
            );
            toast({ title: 'Appointment Completed', description: 'The appointment has been marked as completed.' });
        } catch (err: any) {
            console.error('Failed to update appointment status - endpoint not implemented', err);
            toast({ 
                title: 'Feature Unavailable', 
                description: 'Appointment status updates require backend support. Please contact administrator.', 
                variant: 'destructive' 
            });
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <VetHeader />
            <main className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Today's Appointments</h1>
                    <p className="text-muted-foreground">View and manage today's scheduled appointments</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Appointment Schedule</CardTitle>
                        <CardDescription>All appointments scheduled for today</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Pet Name</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {appointments.map((appointment) => (
                                    <TableRow key={appointment.id}>
                                        <TableCell className="font-medium">{appointment.time}</TableCell>
                                        <TableCell>{appointment.petName}</TableCell>
                                        <TableCell>{appointment.owner}</TableCell>
                                        <TableCell>{appointment.reason}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                appointment.status === 'Completed' ? 'secondary' :
                                                    appointment.status === 'In Progress' ? 'default' :
                                                        'outline'
                                            }>
                                                {appointment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                {/* Show injection buttons based on reason */}
                                                {appointment.reason.toLowerCase().includes('tiêm mũi lẻ') && appointment.petId && (
                                                    <Link to={`/vet/injections/single?petId=${appointment.petId}`}>
                                                        <Button size="sm" variant="outline">
                                                            <Syringe className="w-3 h-3 mr-1" />
                                                            Perform Injection
                                                        </Button>
                                                    </Link>
                                                )}
                                                {appointment.reason.toLowerCase().includes('tiêm theo gói') && appointment.petId && (
                                                    <Link to={`/vet/injections/package?petId=${appointment.petId}`}>
                                                        <Button size="sm" variant="outline">
                                                            <Package className="w-3 h-3 mr-1" />
                                                            Perform Package Injection
                                                        </Button>
                                                    </Link>
                                                )}
                                                {!['Completed', 'Hoàn thành', 'Hủy bỏ'].includes(appointment.status) && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleComplete(appointment.id)}
                                                        disabled={updatingId === appointment.id}
                                                    >
                                                        {updatingId === appointment.id ? 'Updating...' : 'Mark as Complete'}
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
