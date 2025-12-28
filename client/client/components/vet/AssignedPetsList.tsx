import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export type AssignedPet = {
    id: string;
    name: string;
    species: string;
    owner: string;
    lastVisit?: string;
    notes?: string;
};

interface Props {
    pets: AssignedPet[];
    onOpen?: (id: string) => void;
}

export default function AssignedPetsList({ pets }: Props) {
    return (
        <div className="overflow-x-auto">
            <Table className="table-auto">
                <TableHeader>
                    <TableRow>
                        <TableHead className="min-w-[90px] text-center">Pet ID</TableHead>
                        <TableHead className="min-w-[140px]">Name</TableHead>
                        <TableHead className="min-w-[110px] text-center">Species</TableHead>
                        <TableHead className="min-w-[160px]">Owner</TableHead>
                        <TableHead className="min-w-[120px] text-center">Last Visit</TableHead>
                        <TableHead>Notes</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pets.map((p) => (
                        <TableRow key={p.id}>
                            <TableCell className="text-center overflow-hidden truncate">{p.id}</TableCell>
                            <TableCell className="overflow-hidden truncate">{p.name}</TableCell>
                            <TableCell className="text-center overflow-hidden truncate">{p.species}</TableCell>
                            <TableCell className="overflow-hidden truncate">{p.owner}</TableCell>
                            <TableCell className="text-center overflow-hidden truncate">{p.lastVisit || '—'}</TableCell>
                            <TableCell className="overflow-hidden truncate text-sm text-muted-foreground">{p.notes || '—'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
