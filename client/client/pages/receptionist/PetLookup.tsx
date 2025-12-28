import ReceptionHeader from "@/components/ReceptionHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PetLookupTable from "@/components/receptionist/PetLookupTable";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useState } from "react";

const samplePets = [
    { id: 'pet-100', name: 'Bella', owner: 'John Doe', species: 'Dog', health: 'Good' },
    { id: 'pet-101', name: 'Max', owner: 'Mary Smith', species: 'Cat', health: 'Coughing' },
];

export default function PetLookup() {
    const { user } = useAuth();
    if (!user || user.role !== 'receptionist') return <Navigate to="/login" />;

    const [query, setQuery] = useState('');

    const results = samplePets.filter(p => p.id.includes(query) || p.name.toLowerCase().includes(query.toLowerCase()) || p.owner.toLowerCase().includes(query.toLowerCase()));

    return (
        <div className="min-h-screen bg-background">
            <ReceptionHeader />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-3">Pet Information Lookup</h1>
                <p className="text-muted-foreground mb-6">Search pet records by ID, name or owner</p>

                <Card>
                    <CardHeader>
                        <CardTitle>Pet Database</CardTitle>
                        <CardDescription>Search and view pet information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PetLookupTable />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
