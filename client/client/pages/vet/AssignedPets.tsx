import VetHeader from "@/components/VetHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiGet } from "@/api/api";
import { Syringe, Package, ChevronDown, ChevronUp } from "lucide-react";
import type { Pet, ServiceInstance, User as UserType } from "@shared/types";

export default function AssignedPets() {
    const { user } = useAuth();
    const [pets, setPets] = useState<Pet[]>([]);
    const [customers, setCustomers] = useState<UserType[]>([]);
    const [serviceInstances, setServiceInstances] = useState<ServiceInstance[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedPetId, setExpandedPetId] = useState<string | null>(null);

    if (!user || user.role !== 'veterinarian') return <Navigate to="/login" />;

    // Load assigned pets from backend
    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const resp = await apiGet('/doctor/assigned-pets');
                const data = resp?.data ?? [];
                if (!mounted) return;
                setPets(Array.isArray(data) ? data : []);
                setCustomers([]);
                setServiceInstances([]);
            } catch (err: any) {
                console.error('Failed to load assigned pets', err);
                if (!mounted) return;
                setError(err?.message || 'Failed to load assigned pets');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    // Get injection history for a pet
    const getPetInjectionHistory = (petId: string) => {
        return serviceInstances.filter(
            (si) => si.petId === petId && (si.serviceType === "single-vaccine" || si.serviceType === "vaccine-package")
        );
    };

    // Get customer name
    const getCustomerName = (customerId: string) => {
        const customer = customers.find((c) => c.id === customerId);
        return customer?.fullName || "Unknown";
    };

    return (
        <div className="min-h-screen bg-background">
            <VetHeader />
            <main className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Assigned Pets</h1>
                    <p className="text-muted-foreground">Pets assigned to you for ongoing care</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Your Assigned Pets ({pets.length})</CardTitle>
                        <CardDescription>All pets currently under your care</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-8">Loading assigned pets...</div>
                            ) : error ? (
                                <div className="text-center py-8 text-destructive">{error}</div>
                            ) : pets.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No pets assigned yet</div>
                            ) : (
                                pets.map((pet) => {
                                    const injectionHistory = getPetInjectionHistory(pet.id);
                                    const isExpanded = expandedPetId === pet.id;

                                    return (
                                        <div key={pet.id} className="border rounded-lg">
                                            {/* Pet Header */}
                                            <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900">
                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                                    <div>
                                                        <div className="font-medium">{pet.name}</div>
                                                        <div className="text-sm text-muted-foreground capitalize">{pet.type}</div>
                                                    </div>
                                                    <div className="text-sm">
                                                        <div className="text-muted-foreground">Breed</div>
                                                        <div>{pet.breed}</div>
                                                    </div>
                                                    <div className="text-sm">
                                                        <div className="text-muted-foreground">Owner</div>
                                                        <div>{(pet as any).ownerName || 'Unknown'}</div>
                                                    </div>
                                                    <div className="text-sm">
                                                        <div className="text-muted-foreground">Age</div>
                                                        <div>{(pet as any).dateOfBirth ? `${Math.floor((Date.now() - new Date((pet as any).dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years` : 'N/A'}</div>
                                                    </div>
                                                    <div className="text-sm">
                                                        <Badge variant="outline">
                                                            {injectionHistory.length} injection{injectionHistory.length !== 1 ? 's' : ''}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 ml-4">
                                                    <Link to={`/vet/injections/single?petId=${pet.id}`}>
                                                        <Button size="sm" variant="outline">
                                                            <Syringe className="w-4 h-4 mr-1" />
                                                            Single
                                                        </Button>
                                                    </Link>
                                                    <Link to={`/vet/injections/package?petId=${pet.id}`}>
                                                        <Button size="sm" variant="outline">
                                                            <Package className="w-4 h-4 mr-1" />
                                                            Package
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setExpandedPetId(isExpanded ? null : pet.id)}
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronUp className="w-4 h-4" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Injection History (Expanded) */}
                                            {isExpanded && injectionHistory.length > 0 && (
                                                <div className="border-t p-4 bg-gray-50 dark:bg-gray-900">
                                                    <h4 className="font-medium mb-3">Injection History</h4>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Date</TableHead>
                                                                <TableHead>Type</TableHead>
                                                                <TableHead>Vaccines</TableHead>
                                                                <TableHead>Dosage</TableHead>
                                                                <TableHead>Veterinarian</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {injectionHistory.map((instance) => (
                                                                <TableRow key={instance.id}>
                                                                    <TableCell className="text-sm">
                                                                        {new Date(instance.datePerformed).toLocaleDateString()}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge variant={instance.serviceType === "single-vaccine" ? "default" : "secondary"}>
                                                                            {instance.serviceType === "single-vaccine" ? "Single" : "Package"}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell className="text-sm">
                                                                        {instance.vaccinesUsed.map((v) => v.vaccineName).join(", ")}
                                                                    </TableCell>
                                                                    <TableCell className="text-sm">
                                                                        {instance.vaccinesUsed.map((v) => `${v.dosage} ml`).join(", ")}
                                                                    </TableCell>
                                                                    <TableCell className="text-sm">
                                                                        {instance.veterinarianName}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
