import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export type VetAppointment = {
    id: string;
    time: string;
    pet: string;
    owner: string;
    symptoms: string;
    status: string;
};

interface Props {
    appointments: VetAppointment[];
    onView?: (id: string) => void;
    onComplete?: (id: string) => void;
}

export default function VetAppointmentsTable({ appointments, onView, onComplete }: Props) {
    return (
        <Table className="table-auto">
            <TableHeader>
                <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Pet Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Symptoms</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {appointments.map((a) => (
                    <TableRow key={a.id}>
                        <TableCell>{a.time}</TableCell>
                        <TableCell className="overflow-hidden truncate">{a.pet}</TableCell>
                        <TableCell>{a.owner}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{a.symptoms}</TableCell>
                        <TableCell className="font-medium">{a.status}</TableCell>
                        <TableCell className="min-w-[120px] flex items-center justify-end whitespace-nowrap">
                            {/* single action: mark as complete; disabled / replaced when status is completed */}
                            {a.status?.toLowerCase?.() === 'completed' ? (
                                <span className="px-2 py-1 text-sm rounded bg-green-100 text-green-700">Completed</span>
                            ) : (
                                <button aria-label={`Mark appointment ${a.id} as completed`} onClick={() => onComplete?.(a.id)} className="px-2 py-1 text-sm rounded hover:opacity-90 bg-primary text-white">Mark as Complete</button>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
