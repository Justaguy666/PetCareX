import VetHeader from "@/components/VetHeader";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Syringe, Calendar, User, PawPrint, DollarSign, FileText, AlertTriangle, PackageX } from "lucide-react";
import type { Pet, Vaccine, ServiceType, ServiceInstance, User as UserType } from "@shared/types";
import {
    getVaccineStock,
    validateVaccineStock,
    deductVaccineStock,
    getStockStatus,
    getStockBadgeClass
} from "@/lib/inventoryUtils";

export default function SingleDoseInjections() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [searchParams] = useSearchParams();

    // State
    const [pets, setPets] = useState<Pet[]>([]);
    const [customers, setCustomers] = useState<UserType[]>([]);
    const [vaccines, setVaccines] = useState<Vaccine[]>([]);
    const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
    const [serviceInstances, setServiceInstances] = useState<ServiceInstance[]>([]);

    const [selectedPetId, setSelectedPetId] = useState("");
    const [selectedVaccineId, setSelectedVaccineId] = useState("");
    const [dosage, setDosage] = useState("");
    const [notes, setNotes] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [vaccineStockLevels, setVaccineStockLevels] = useState<Record<string, number>>({});

    // Redirect if not authenticated
    if (!user || user.role !== "veterinarian") {
        return <Navigate to="/login" />;
    }

    // Load data from localStorage
    useEffect(() => {
        try {
            const loadedPets = JSON.parse(localStorage.getItem("petcare_pets") || "[]");
            const loadedCustomers = JSON.parse(localStorage.getItem("petcare_users") || "[]").filter(
                (u: UserType) => u.role === "customer"
            );
            const loadedVaccines = JSON.parse(localStorage.getItem("petcare_vaccines") || "[]");
            const loadedServiceTypes = JSON.parse(localStorage.getItem("petcare_service_types") || "[]");
            const loadedInstances = JSON.parse(localStorage.getItem("petcare_service_instances") || "[]");

            setPets(loadedPets);
            setCustomers(loadedCustomers);
            setVaccines(loadedVaccines);
            setServiceTypes(loadedServiceTypes);
            setServiceInstances(loadedInstances);

            // Load vaccine stock levels
            const branchId = user.branchId || "branch-1";
            const stockLevels: Record<string, number> = {};
            loadedVaccines.forEach((vaccine: Vaccine) => {
                stockLevels[vaccine.id] = getVaccineStock(branchId, vaccine.id);
            });
            setVaccineStockLevels(stockLevels);

            // Check if data is empty and show warning
            if (loadedVaccines.length === 0) {
                toast({
                    title: "No Vaccines Available",
                    description: "Please ask admin to add vaccines first.",
                    variant: "destructive",
                });
            }

            // Pre-select pet from query parameter
            const petIdFromQuery = searchParams.get("petId");
            if (petIdFromQuery && loadedPets.some((p: Pet) => p.id === petIdFromQuery)) {
                setSelectedPetId(petIdFromQuery);
            }
        } catch (error) {
            console.error("Error loading data:", error);
            toast({
                title: "Error",
                description: "Failed to load data. Please refresh the page.",
                variant: "destructive",
            });
        }
    }, [searchParams, toast]);

    // Get selected pet and vaccine details
    const selectedPet = pets.find((p) => p.id === selectedPetId);
    const selectedVaccine = vaccines.find((v) => v.id === selectedVaccineId);
    const singleDoseServiceType = serviceTypes.find((st) => st.id === "single-vaccine");
    const petOwner = selectedPet ? customers.find((c) => c.id === selectedPet.customerId) : null;

    // Calculate total price
    const calculateTotalPrice = (): number => {
        if (!singleDoseServiceType || !selectedVaccine) return 0;
        return singleDoseServiceType.basePrice + selectedVaccine.price;
    };

    // Get injection history for selected pet
    const petInjectionHistory = selectedPetId
        ? serviceInstances.filter(
            (si) => si.petId === selectedPetId && si.serviceType === "single-vaccine"
        )
        : [];

    // Handle save injection
    const handleSaveInjection = () => {
        // Validation
        if (!selectedPetId) {
            toast({ title: "Error", description: "Please select a pet", variant: "destructive" });
            return;
        }
        if (!selectedVaccineId) {
            toast({ title: "Error", description: "Please select a vaccine", variant: "destructive" });
            return;
        }
        if (!dosage || Number(dosage) <= 0) {
            toast({ title: "Error", description: "Please enter a valid dosage", variant: "destructive" });
            return;
        }
        if (!singleDoseServiceType) {
            toast({ title: "Error", description: "Service type not found", variant: "destructive" });
            return;
        }

        // Validate vaccine stock availability
        const branchId = user.branchId || "branch-1";
        const validation = validateVaccineStock(branchId, selectedVaccineId, 1);

        if (!validation.valid) {
            toast({
                title: "Insufficient Vaccine Stock",
                description: validation.message,
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            const newInstance: ServiceInstance = {
                id: `si-${Date.now()}`,
                serviceType: "single-vaccine",
                veterinarianId: user.id,
                veterinarianName: user.fullName,
                petId: selectedPetId,
                petName: selectedPet!.name,
                customerId: selectedPet!.customerId,
                customerName: petOwner?.fullName || "Unknown",
                branchId: user.branchId || "default-branch",
                basePrice: singleDoseServiceType.basePrice,
                vaccineCost: selectedVaccine!.price,
                vaccinesUsed: [
                    {
                        vaccineId: selectedVaccineId,
                        vaccineName: selectedVaccine!.name,
                        dosage: Number(dosage),
                        administered: true,
                    },
                ],
                datePerformed: new Date().toISOString(),
                notes: notes.trim() || undefined,
                createdAt: new Date().toISOString(),
            };

            const updatedInstances = [...serviceInstances, newInstance];
            localStorage.setItem("petcare_service_instances", JSON.stringify(updatedInstances));
            setServiceInstances(updatedInstances);

            // Deduct vaccine stock
            const stockDeducted = deductVaccineStock(branchId, selectedVaccineId, 1);
            if (stockDeducted) {
                // Update stock levels
                const updatedStockLevels = { ...vaccineStockLevels };
                updatedStockLevels[selectedVaccineId] = getVaccineStock(branchId, selectedVaccineId);
                setVaccineStockLevels(updatedStockLevels);
            } else {
                console.warn("Failed to deduct vaccine stock, but injection was saved");
            }

            // Reset form
            setSelectedVaccineId("");
            setDosage("");
            setNotes("");

            toast({
                title: "Success",
                description: "Injection saved successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save injection",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <VetHeader />

            <main className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Single-Dose Injections</h1>
                    <p className="text-muted-foreground">Administer individual vaccines to pets</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Pet Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PawPrint className="w-5 h-5" />
                                    Select Pet
                                </CardTitle>
                                <CardDescription>Choose the pet to receive the injection</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Pet *</Label>
                                    <Select value={selectedPetId} onValueChange={setSelectedPetId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a pet" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pets.length === 0 ? (
                                                <div className="p-2 text-sm text-muted-foreground text-center">
                                                    No pets available. Please add pets first.
                                                </div>
                                            ) : (
                                                pets.map((pet) => {
                                                    const owner = customers.find((c) => c.id === pet.customerId);
                                                    return (
                                                        <SelectItem key={pet.id} value={pet.id}>
                                                            {pet.name} ({pet.type}) - Owner: {owner?.fullName || "Unknown"}
                                                        </SelectItem>
                                                    );
                                                })
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedPet && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg space-y-2">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-blue-600" />
                                            <span className="font-medium">Owner:</span>
                                            <span>{petOwner?.fullName || "Unknown"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Type:</span>
                                            <Badge variant="outline">{selectedPet.type}</Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Breed:</span>
                                            <span>{selectedPet.breed}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Age:</span>
                                            <span>{selectedPet.age} years</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Weight:</span>
                                            <span>{selectedPet.weight} kg</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Vaccine Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Syringe className="w-5 h-5" />
                                    Vaccine Details
                                </CardTitle>
                                <CardDescription>Select vaccine and enter dosage information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Vaccine *</Label>
                                    <Select value={selectedVaccineId} onValueChange={setSelectedVaccineId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a vaccine" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vaccines.length === 0 ? (
                                                <div className="p-2 text-sm text-muted-foreground text-center">
                                                    No vaccines available. Please contact admin.
                                                </div>
                                            ) : (
                                                vaccines.map((vaccine) => {
                                                    const stock = vaccineStockLevels[vaccine.id] || 0;
                                                    const stockStatus = getStockStatus(stock);
                                                    const isOutOfStock = stock === 0;
                                                    return (
                                                        <SelectItem
                                                            key={vaccine.id}
                                                            value={vaccine.id}
                                                            disabled={isOutOfStock}
                                                        >
                                                            {vaccine.name} - {vaccine.price.toLocaleString()} VND
                                                            {isOutOfStock && " (OUT OF STOCK)"}
                                                            {!isOutOfStock && stockStatus !== "normal" && ` (${stock} doses - ${stockStatus.toUpperCase()})`}
                                                        </SelectItem>
                                                    );
                                                })
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedVaccine && (
                                    <>
                                        <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Manufacturer:</span>
                                                <span>{selectedVaccine.manufacturer || "N/A"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Description:</span>
                                                <span className="text-sm">{selectedVaccine.description || "N/A"}</span>
                                            </div>
                                        </div>

                                        {(() => {
                                            const stock = vaccineStockLevels[selectedVaccine.id] || 0;
                                            const stockStatus = getStockStatus(stock);
                                            const badgeClass = getStockBadgeClass(stockStatus);
                                            const isLowOrCritical = stockStatus === "low" || stockStatus === "critical";
                                            const isOutOfStock = stockStatus === "out";

                                            return (
                                                <div className={`p-4 rounded-lg border-2 ${isOutOfStock ? "bg-red-50 dark:bg-red-950 border-red-300" :
                                                        isLowOrCritical ? "bg-orange-50 dark:bg-orange-950 border-orange-300" :
                                                            "bg-blue-50 dark:bg-blue-950 border-blue-300"
                                                    }`}>
                                                    <div className="flex items-center gap-3">
                                                        {isOutOfStock ? (
                                                            <PackageX className="w-5 h-5 text-red-600" />
                                                        ) : isLowOrCritical ? (
                                                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                                                        ) : (
                                                            <Syringe className="w-5 h-5 text-blue-600" />
                                                        )}
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">Stock Available:</span>
                                                                <span className="text-lg font-bold">{stock} doses</span>
                                                                <Badge variant="outline" className={badgeClass}>
                                                                    {stockStatus === "out" && "Out of Stock"}
                                                                    {stockStatus === "critical" && "Critical"}
                                                                    {stockStatus === "low" && "Low Stock"}
                                                                    {stockStatus === "normal" && "In Stock"}
                                                                </Badge>
                                                            </div>
                                                            {isOutOfStock && (
                                                                <p className="text-sm text-red-600 mt-1">
                                                                    Cannot administer - no doses available at this branch
                                                                </p>
                                                            )}
                                                            {isLowOrCritical && (
                                                                <p className="text-sm text-orange-600 mt-1">
                                                                    Warning: Stock level is {stockStatus} - consider restocking
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </>
                                )}

                                <div>
                                    <Label>Dosage (ml) *</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={dosage}
                                        onChange={(e) => setDosage(e.target.value)}
                                        placeholder="Enter dosage (e.g., 1.0)"
                                    />
                                </div>

                                <div>
                                    <Label>Notes (Optional)</Label>
                                    <Textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Any additional notes about the injection..."
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Button */}
                        <Button
                            onClick={handleSaveInjection}
                            disabled={isLoading || !selectedPetId || !selectedVaccineId || !dosage}
                            className="w-full"
                            size="lg"
                        >
                            <Syringe className="w-4 h-4 mr-2" />
                            {isLoading ? "Saving..." : "Save Injection"}
                        </Button>
                    </div>

                    {/* Right Column - Summary & History */}
                    <div className="space-y-6">
                        {/* Price Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5" />
                                    Price Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Service Type:</span>
                                    <span className="font-medium">Single-Dose</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Base Price:</span>
                                    <span>{singleDoseServiceType?.basePrice.toLocaleString() || 0} VND</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Vaccine Cost:</span>
                                    <span>{selectedVaccine?.price.toLocaleString() || 0} VND</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between items-center">
                                    <span className="font-bold text-lg">Total:</span>
                                    <span className="font-bold text-lg text-primary">
                                        {calculateTotalPrice().toLocaleString()} VND
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Session Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Date:</span>
                                    <span>{new Date().toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Veterinarian:</span>
                                    <span>{user.fullName}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Injection History */}
                {selectedPetId && petInjectionHistory.length > 0 && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Injection History - {selectedPet?.name}</CardTitle>
                            <CardDescription>Previous single-dose injections for this pet</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Vaccine</TableHead>
                                        <TableHead>Dosage</TableHead>
                                        <TableHead>Veterinarian</TableHead>
                                        <TableHead>Cost</TableHead>
                                        <TableHead>Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {petInjectionHistory.map((instance) => (
                                        <TableRow key={instance.id}>
                                            <TableCell>{new Date(instance.datePerformed).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                {instance.vaccinesUsed.map((v) => v.vaccineName).join(", ")}
                                            </TableCell>
                                            <TableCell>
                                                {instance.vaccinesUsed.map((v) => `${v.dosage} ml`).join(", ")}
                                            </TableCell>
                                            <TableCell>{instance.veterinarianName}</TableCell>
                                            <TableCell>
                                                {((instance.basePrice || 0) + (instance.vaccineCost || 0)).toLocaleString()}{" "}
                                                VND
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {instance.notes || "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
