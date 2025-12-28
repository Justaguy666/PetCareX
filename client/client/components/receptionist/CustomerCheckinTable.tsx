import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import sampleReceptionData from "@/data/sampleReceptionData";
import { useToast } from "@/hooks/use-toast";

interface Props {
    appointments?: any[];
    onUpdateStatus?: (id: string, status: string) => Promise<void> | void;
}

export default function CustomerCheckinTable({ appointments, onUpdateStatus }: Props) {
    const { toast } = useToast();

    // Fallback to local/demo data only if appointments prop is not provided
    const localAppointments = React.useMemo(() => {
        if (Array.isArray(appointments)) return appointments;
        try {
            const saved = localStorage.getItem("petcare_appointments");
            if (saved) return JSON.parse(saved);
        } catch (e) { }
        return sampleReceptionData.sampleReceptionAppointments || [];
    }, [appointments]);

    async function handleUpdateStatus(id: string, status: string) {
        if (onUpdateStatus) {
            try {
                await onUpdateStatus(id, status);
                toast({ title: `Appointment ${status}`, description: `Appointment ${id} marked ${status}.` });
            } catch (e: any) {
                console.error('Failed to update status', e);
                toast({ title: 'Error', description: e?.message || 'Failed to update appointment', variant: 'destructive' });
            }
        } else {
            // fallback local update for demo
            try {
                const next = localAppointments.map((a: any) => (a.id === id ? { ...a, status } : a));
                localStorage.setItem("petcare_appointments", JSON.stringify(next));
                toast({ title: `Appointment ${status}`, description: `Appointment ${id} marked ${status}.` });
            } catch (e) {
                console.error(e);
            }
        }
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Pet</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {localAppointments.map((a: any) => (
                    <TableRow key={a.id}>
                        <TableCell>{a.appointmentTime ?? a.time}</TableCell>
                        <TableCell>{a.appointmentDate ?? a.date}</TableCell>
                        <TableCell>{a.petName ?? a.petId ?? a.pet ?? "—"}</TableCell>
                        <TableCell>{a.customerName ?? a.customerId ?? a.owner ?? "—"}</TableCell>
                        <TableCell className="font-medium">{a.status}</TableCell>
                        <TableCell>
                            <div className="flex gap-2">
                                {a.status?.toLowerCase() !== "checked-in" && (
                                    <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(a.id, "checked-in")}>
                                        Check in
                                    </Button>
                                )}

                                {a.status?.toLowerCase() !== "completed" && (
                                    <Button size="sm" onClick={() => handleUpdateStatus(a.id, "completed")}>
                                        Complete
                                    </Button>
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
