import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import sampleReceptionData from "@/data/sampleReceptionData";

export default function PetLookupTable() {
    const pets = sampleReceptionData.sampleReceptionPets || [];
    const customers = sampleReceptionData.sampleReceptionCustomers || [];

    const [q, setQ] = React.useState("");

    const results = pets.filter((p: any) => {
        const owner = customers.find((c: any) => c.id === p.ownerId);
        const text = `${p.name} ${p.species} ${p.breed} ${owner?.fullName ?? ""}`.toLowerCase();
        return text.includes(q.toLowerCase());
    });

    return (
        <div>
            <div className="mb-4"><Input placeholder="Search pets or owners" value={q} onChange={(e) => setQ(e.target.value)} /></div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Species</TableHead>
                        <TableHead>Breed</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Last Visit</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {results.map((p: any) => (
                        <TableRow key={p.id}>
                            <TableCell>{p.name}</TableCell>
                            <TableCell>{p.species}</TableCell>
                            <TableCell>{p.breed}</TableCell>
                            <TableCell>{customers.find((c: any) => c.id === p.ownerId)?.fullName ?? "—"}</TableCell>
                            <TableCell>{p.lastVisit ?? "—"}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
