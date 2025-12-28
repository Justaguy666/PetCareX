import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from "@/components/ui/alert-dialog";

export interface MedicalRecordItem {
    id: string;
    pet: string;
    owner: string;
    date?: string;
    symptoms?: string;
    diagnosis?: string;
    prescription?: any[] | string;
    followUp?: string;
    vet?: string;
}

interface Props {
    records: MedicalRecordItem[];
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export default function MedicalRecordsTable({ records, onEdit, onDelete }: Props) {
    const [deleteId, setDeleteId] = useState<string | null>(null);

    return (
        <>
            <Table className="table-auto">
                <TableHeader>
                    <TableRow>
                        <TableHead className="min-w-[80px] text-center">Pet</TableHead>
                        <TableHead className="min-w-[80px] text-center">Owner</TableHead>
                        <TableHead className="min-w-[160px]">Symptoms</TableHead>
                        <TableHead className="min-w-[160px]">Diagnosis</TableHead>
                        <TableHead className="min-w-[160px]">Prescription</TableHead>
                        <TableHead className="min-w-[120px] text-center">Follow-up</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {records.map((r) => (
                        <TableRow key={r.id}>
                            <TableCell className="overflow-hidden truncate text-center">{r.pet}</TableCell>
                            <TableCell className="overflow-hidden truncate text-center">{r.owner}</TableCell>
                            <TableCell className="overflow-hidden truncate">{r.symptoms}</TableCell>
                            <TableCell className="overflow-hidden truncate">{r.diagnosis || '—'}</TableCell>
                            <TableCell className="overflow-hidden truncate">{Array.isArray(r.prescription) ? r.prescription.map((p: any) => typeof p === 'string' ? p : `${p.name} (${p.dose} x${p.qty})`).join(', ') : (r.prescription || '—')}</TableCell>
                            <TableCell className="overflow-hidden truncate text-center">{r.followUp || '—'}</TableCell>
                            <TableCell className="min-w-[140px] flex items-center gap-2 justify-end whitespace-nowrap">
                                {/* Edit button - accessible label */}
                                <button aria-label={`Edit record ${r.id}`} onClick={() => onEdit?.(r.id)} className="px-2 py-1 text-sm rounded hover:opacity-90 bg-transparent text-primary">Edit</button>
                                {/* Delete button triggers internal confirm modal; confirm forwards to onDelete */}
                                <button aria-label={`Delete record ${r.id}`} onClick={() => setDeleteId(r.id)} className="px-2 py-1 text-sm rounded hover:opacity-90 text-red-600 bg-transparent">Delete</button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Confirmation modal for delete using existing alert-dialog component */}
            <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Medical Record</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to delete record {deleteId} ? This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { if (deleteId) onDelete?.(deleteId); setDeleteId(null); }} className="bg-red-600 text-white">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
