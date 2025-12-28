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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Syringe, Calendar, User, PawPrint, DollarSign, FileText, Package, ChevronDown, ChevronUp, AlertTriangle, PackageX } from "lucide-react";
import type { Pet, Vaccine, VaccinePackage, ServiceType, ServiceInstance, User as UserType } from "@shared/types";
import {
    getVaccineStock,
    validateVaccineStock,
    deductVaccineStock,
    getStockStatus,
    getStockBadgeClass
} from "@/lib/inventoryUtils";

export default function PackageInjections() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [searchParams] = useSearchParams();

    // State
    const [pets, setPets] = useState<Pet[]>([]);
    const [customers, setCustomers] = useState<UserType[]>([]);
    const [vaccines, setVaccines] = useState<Vaccine[]>([]);
    const [vaccinePackages, setVaccinePackages] = useState<VaccinePackage[]>([]);
    const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
    const [serviceInstances, setServiceInstances] = useState<ServiceInstance[]>([]);

    const [selectedPetId, setSelectedPetId] = useState("");
    const [selectedPackageId, setSelectedPackageId] = useState("");
    const [cycleStage, setCycleStage] = useState("1");
    const [notes, setNotes] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPackageDetails, setShowPackageDetails] = useState(false);
    const [vaccineStockLevels, setVaccineStockLevels] = useState<Record<string, number>>({});

    // Track which vaccines were administered and their dosages
    const [vaccineAdministration, setVaccineAdministration] = useState<{
        [vaccineId: string]: { administered: boolean; dosage: string };
    }>({});

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
            const loadedPackages = JSON.parse(localStorage.getItem("petcare_vaccine_packages") || "[]");
            const loadedServiceTypes = JSON.parse(localStorage.getItem("petcare_service_types") || "[]");
            const loadedInstances = JSON.parse(localStorage.getItem("petcare_service_instances") || "[]");

            setPets(loadedPets);
            setCustomers(loadedCustomers);
            setVaccines(loadedVaccines);
            setVaccinePackages(loadedPackages);
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
            if (loadedPackages.length === 0) {
                toast({
                    title: "No Vaccine Packages Available",
                    description: "Please ask admin to add vaccine packages first.",
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

    // Reset vaccine administration when package changes
    useEffect(() => {
        if (selectedPackageId) {
            const selectedPackage = vaccinePackages.find((p) => p.id === selectedPackageId);
            if (selectedPackage) {
                const initial: typeof vaccineAdministration = {};
                selectedPackage.vaccines.forEach((v) => {
                    initial[v.vaccineId] = { administered: false, dosage: v.dosage.toString() };
                });
                setVaccineAdministration(initial);
            }
        }
    }, [selectedPackageId, vaccinePackages]);

    // Get selected pet, package and service type details
    const selectedPet = pets.find((p) => p.id === selectedPetId);
    const selectedPackage = vaccinePackages.find((p) => p.id === selectedPackageId);
    const packageServiceType = serviceTypes.find((st) => st.id === "vaccine-package");
    const petOwner = selectedPet ? customers.find((c) => c.id === selectedPet.customerId) : null;

    // Get vaccine details for package
    const getVaccineDetails = (vaccineId: string) => {
        return vaccines.find((v) => v.id === vaccineId);
    };

    // Calculate total price
    const calculateTotalPrice = (): number => {
        if (!packageServiceType || !selectedPackage) return 0;
        return packageServiceType.basePrice + selectedPackage.price;
    };

    // Get injection history for selected pet (package injections only)
    const petPackageHistory = selectedPetId
        ? serviceInstances.filter(
            (si) => si.petId === selectedPetId && si.serviceType === "vaccine-package"
        )
        : [];

    // Handle checkbox change
    const handleAdministeredChange = (vaccineId: string, checked: boolean) => {
        setVaccineAdministration((prev) => ({
            ...prev,
            [vaccineId]: { ...prev[vaccineId], administered: checked },
        }));
    };

    // Handle dosage change
    const handleDosageChange = (vaccineId: string, dosage: string) => {
        setVaccineAdministration((prev) => ({
            ...prev,
            [vaccineId]: { ...prev[vaccineId], dosage },
        }));
    };

    // Handle save injection
    const handleSaveInjection = () => {
        // Validation
        if (!selectedPetId) {
            toast({ title: "Error", description: "Please select a pet", variant: "destructive" });
            return;
        }
        if (!selectedPackageId) {
            toast({ title: "Error", description: "Please select a vaccine package", variant: "destructive" });
            return;
        }
        if (!packageServiceType) {
            toast({ title: "Error", description: "Service type not found", variant: "destructive" });
            return;
        }

        // Check if at least one vaccine is administered
        const administeredVaccines = Object.entries(vaccineAdministration).filter(
            ([_, data]) => data.administered
        );
        if (administeredVaccines.length === 0) {
            toast({ title: "Error", description: "Please select at least one vaccine to administer", variant: "destructive" });
            return;
        }

        // Validate dosages for administered vaccines
        for (const [vaccineId, data] of administeredVaccines) {
            if (!data.dosage || Number(data.dosage) <= 0) {
                const vaccine = getVaccineDetails(vaccineId);
                toast({
                    title: "Error",
                    description: `Please enter a valid dosage for ${vaccine?.name}`,
                    variant: "destructive",
                });
                return;
            }
        }

        // Validate vaccine stock for all administered vaccines
        const branchId = user.branchId || "branch-1";
        for (const [vaccineId, data] of administeredVaccines) {
            const validation = validateVaccineStock(branchId, vaccineId, 1);
            if (!validation.valid) {
                const vaccine = getVaccineDetails(vaccineId);
                toast({
                    title: "Insufficient Vaccine Stock",
                    description: `Cannot administer ${vaccine?.name}: ${validation.message}`,
                    variant: "destructive",
                });
                return;
            }
        }

        setIsLoading(true);

        try {
            const vaccinesUsed = administeredVaccines.map(([vaccineId, data]) => {
                const vaccine = getVaccineDetails(vaccineId);
                return {
                    vaccineId,
                    vaccineName: vaccine?.name || "Unknown",
                    dosage: Number(data.dosage),
                    administered: true,
                    monthMark: selectedPackage?.monthMark,
                };
            });

            const newInstance: ServiceInstance = {
                id: `si-${Date.now()}`,
                serviceType: "vaccine-package",
                veterinarianId: user.id,
                veterinarianName: user.fullName,
                petId: selectedPetId,
                petName: selectedPet!.name,
                customerId: selectedPet!.customerId,
                customerName: petOwner?.fullName || "Unknown",
                branchId: user.branchId || "default-branch",
                basePrice: packageServiceType.basePrice,
                packageCost: selectedPackage!.price,
                packageId: selectedPackageId,
                vaccinesUsed,
                datePerformed: new Date().toISOString(),
                notes: notes.trim() || undefined,
                createdAt: new Date().toISOString(),
            };

            const updatedInstances = [...serviceInstances, newInstance];
            localStorage.setItem("petcare_service_instances", JSON.stringify(updatedInstances));
            setServiceInstances(updatedInstances);

            // Deduct vaccine stock for all administered vaccines
            const failedDeductions: string[] = [];
            for (const [vaccineId, _] of administeredVaccines) {
                const stockDeducted = deductVaccineStock(branchId, vaccineId, 1);
                if (!stockDeducted) {
                    const vaccine = getVaccineDetails(vaccineId);
                    failedDeductions.push(vaccine?.name || vaccineId);
                }
            }

            // Update stock levels
            const updatedStockLevels = { ...vaccineStockLevels };
            vaccines.forEach((vaccine: Vaccine) => {
                updatedStockLevels[vaccine.id] = getVaccineStock(branchId, vaccine.id);
            });
            setVaccineStockLevels(updatedStockLevels);

            if (failedDeductions.length > 0) {
                console.warn(`Failed to deduct stock for: ${failedDeductions.join(", ")}`);
            }

            // Reset form
            setSelectedPackageId("");
            setCycleStage("1");
            setNotes("");
            setVaccineAdministration({});

            toast({
                title: "Success",
                description: "Package injection saved successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save package injection",
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
                    <h1 className="text-3xl font-bold mb-2">Package Injections</h1>
                    <p className="text-muted-foreground">Administer vaccine packages to pets</p>
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
                                <CardDescription>Choose the pet to receive the package injection</CardDescription>
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
                                            <span className="font-medium">Age:</span>
                                            <span>{selectedPet.age} years ({selectedPet.age * 12} months)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Weight:</span>
                                            <span>{selectedPet.weight} kg</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Package Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Vaccine Package
                                </CardTitle>
                                <CardDescription>Select the vaccine package to administer</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Package *</Label>
                                    <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a package" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vaccinePackages.length === 0 ? (
                                                <div className="p-2 text-sm text-muted-foreground text-center">
                                                    No vaccine packages available. Please contact admin.
                                                </div>
                                            ) : (
                                                vaccinePackages.map((pkg) => (
                                                    <SelectItem key={pkg.id} value={pkg.id}>
                                                        {pkg.name} - Month {pkg.monthMark} - {pkg.price.toLocaleString()} VND
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedPackage && (
                                    <>
                                        <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Month Mark:</span>
                                                <Badge>{selectedPackage.monthMark} months</Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Cycle:</span>
                                                <span>{selectedPackage.cycle} times</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Description:</span>
                                                <span className="text-sm">{selectedPackage.description || "N/A"}</span>
                                            </div>
                                        </div>

                                        {/* Expandable Vaccine List */}
                                        <div className="border rounded-lg">
                                            <button
                                                onClick={() => setShowPackageDetails(!showPackageDetails)}
                                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900"
                                            >
                                                <span className="font-medium">Vaccines in Package ({selectedPackage.vaccines.length})</span>
                                                {showPackageDetails ? (
                                                    <ChevronUp className="w-4 h-4" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4" />
                                                )}
                                            </button>

                                            {showPackageDetails && (
                                                <div className="border-t p-4 space-y-4">
                                                    {selectedPackage.vaccines.map((packageVaccine) => {
                                                        const vaccine = getVaccineDetails(packageVaccine.vaccineId);
                                                        if (!vaccine) return null;

                                                        const admin = vaccineAdministration[packageVaccine.vaccineId] || {
                                                            administered: false,
                                                            dosage: packageVaccine.dosage.toString(),
                                                        };

                                                        const stock = vaccineStockLevels[packageVaccine.vaccineId] || 0;
                                                        const stockStatus = getStockStatus(stock);
                                                        const badgeClass = getStockBadgeClass(stockStatus);
                                                        const isOutOfStock = stock === 0;

                                                        return (
                                                            <div
                                                                key={packageVaccine.vaccineId}
                                                                className={`p-3 border rounded-lg space-y-3 ${isOutOfStock ? 'bg-red-50 dark:bg-red-950 border-red-300' : ''}`}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <Checkbox
                                                                        checked={admin.administered}
                                                                        disabled={isOutOfStock}
                                                                        onCheckedChange={(checked) =>
                                                                            handleAdministeredChange(
                                                                                packageVaccine.vaccineId,
                                                                                checked as boolean
                                                                            )
                                                                        }
                                                                    />
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-medium">{vaccine.name}</span>
                                                                            {isOutOfStock && (
                                                                                <PackageX className="w-4 h-4 text-red-600" />
                                                                            )}
                                                                        </div>
                                                                        <div className="text-sm text-muted-foreground">
                                                                            Manufacturer: {vaccine.manufacturer || "N/A"}
                                                                        </div>
                                                                        <div className="text-sm text-muted-foreground">
                                                                            Recommended: {packageVaccine.dosage} dose(s)
                                                                        </div>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <span className="text-sm text-muted-foreground">Stock:</span>
                                                                            <span className="text-sm font-semibold">{stock} doses</span>
                                                                            <Badge variant="outline" className={`${badgeClass} text-xs`}>
                                                                                {stockStatus === "out" && "Out"}
                                                                                {stockStatus === "critical" && "Critical"}
                                                                                {stockStatus === "low" && "Low"}
                                                                                {stockStatus === "normal" && "Available"}
                                                                            </Badge>
                                                                        </div>
                                                                        {isOutOfStock && (
                                                                            <p className="text-xs text-red-600 mt-1">
                                                                                Cannot administer - no doses available
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {admin.administered && (
                                                                    <div>
                                                                        <Label className="text-xs">Dosage (ml) *</Label>
                                                                        <Input
                                                                            type="number"
                                                                            step="0.1"
                                                                            min="0"
                                                                            value={admin.dosage}
                                                                            onChange={(e) =>
                                                                                handleDosageChange(packageVaccine.vaccineId, e.target.value)
                                                                            }
                                                                            placeholder="Enter dosage"
                                                                            className="mt-1"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <Label>Cycle Stage</Label>
                                            <Select value={cycleStage} onValueChange={setCycleStage}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from({ length: selectedPackage.cycle }, (_, i) => i + 1).map((stage) => (
                                                        <SelectItem key={stage} value={stage.toString()}>
                                                            Cycle {stage} of {selectedPackage.cycle}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <Label>Notes (Optional)</Label>
                                    <Textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Any additional notes about this package injection session..."
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Button */}
                        <Button
                            onClick={handleSaveInjection}
                            disabled={isLoading || !selectedPetId || !selectedPackageId}
                            className="w-full"
                            size="lg"
                        >
                            <Syringe className="w-4 h-4 mr-2" />
                            {isLoading ? "Saving..." : "Save Package Injection"}
                        </Button>
                    </div>

                    {/* Right Column - Summary & Info */}
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
                                    <span className="font-medium">Package</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Base Price:</span>
                                    <span>{packageServiceType?.basePrice.toLocaleString() || 0} VND</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Package Cost:</span>
                                    <span>{selectedPackage?.price.toLocaleString() || 0} VND</span>
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
                                {selectedPackage && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">Vaccines:</span>
                                        <span>
                                            {Object.values(vaccineAdministration).filter((v) => v.administered).length} /{" "}
                                            {selectedPackage.vaccines.length}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Package History */}
                {selectedPetId && petPackageHistory.length > 0 && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Package Injection History - {selectedPet?.name}</CardTitle>
                            <CardDescription>Previous package injections for this pet</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Package</TableHead>
                                        <TableHead>Vaccines Administered</TableHead>
                                        <TableHead>Veterinarian</TableHead>
                                        <TableHead>Cost</TableHead>
                                        <TableHead>Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {petPackageHistory.map((instance) => {
                                        const pkg = vaccinePackages.find((p) => p.id === instance.packageId);
                                        return (
                                            <TableRow key={instance.id}>
                                                <TableCell>{new Date(instance.datePerformed).toLocaleDateString()}</TableCell>
                                                <TableCell>{pkg?.name || "Unknown Package"}</TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        {instance.vaccinesUsed.map((v, idx) => (
                                                            <div key={idx} className="text-sm">
                                                                • {v.vaccineName} ({v.dosage} ml)
                                                            </div>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{instance.veterinarianName}</TableCell>
                                                <TableCell>
                                                    {((instance.basePrice || 0) + (instance.packageCost || 0)).toLocaleString()}{" "}
                                                    VND
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {instance.notes || "-"}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
