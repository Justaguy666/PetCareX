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
import { apiGet, apiPost } from "@/api/api";

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
    const [loading, setLoading] = useState(true);

    // Track which vaccines were administered and their dosages
    const [vaccineAdministration, setVaccineAdministration] = useState<{
        [vaccineId: string]: { administered: boolean; dosage: string };
    }>({});

    // Redirect if not authenticated
    if (!user || user.role !== "veterinarian") {
        return <Navigate to="/login" />;
    }

    // Load data from API
    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const [petsRes, packagesRes, vaccinesRes] = await Promise.all([
                    apiGet('/doctor/pets-by-type/Tiêm theo gói'),
                    apiGet('/doctor/package-inventory'),
                    apiGet('/doctor/vaccine-inventory')
                ]);

                if (!mounted) return;

                const loadedPets = (petsRes?.data ?? []).map((p: any) => ({
                    id: String(p.id),
                    name: p.name || p.pet_name,
                    type: p.species || p.type,
                    breed: p.breed,
                    customerId: p.owner_id ? String(p.owner_id) : '',
                    ownerName: p.ownerName || '',
                    ownerPhone: p.ownerPhone || ''
                }));

                const loadedPackages = (packagesRes?.data ?? []).map((pkg: any) => ({
                    id: String(pkg.id),
                    name: pkg.name || pkg.package_name,
                    price: Number(pkg.price) || 0,
                    description: pkg.description || '',
                    stock: Number(pkg.stock) || 0,
                    vaccines: pkg.vaccines || []
                }));

                const loadedVaccines = (vaccinesRes?.data ?? []).map((v: any) => ({
                    id: String(v.id),
                    name: v.name || v.vaccine_name,
                    price: Number(v.price) || 0,
                    description: v.description || '',
                    stock: Number(v.stock) || 0
                }));

                setPets(loadedPets);
                setVaccinePackages(loadedPackages);
                setVaccines(loadedVaccines);

                if (loadedPackages.length === 0) {
                    toast({
                        title: "No Vaccine Packages Available",
                        description: "Please ask admin to add vaccine packages first.",
                        variant: "destructive",
                    });
                }

                // Pre-select pet from query parameter
                const petIdFromQuery = searchParams.get("petId");
                if (petIdFromQuery && loadedPets.some((p: any) => p.id === petIdFromQuery)) {
                    setSelectedPetId(petIdFromQuery);
                }
            } catch (error) {
                console.error("Error loading data:", error);
                if (mounted) {
                    toast({
                        title: "Error",
                        description: "Failed to load data. Please refresh the page.",
                        variant: "destructive",
                    });
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchData();
        return () => { mounted = false; };
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
    const handleSaveInjection = async () => {
        // Validation
        if (!selectedPetId) {
            toast({ title: "Error", description: "Please select a pet", variant: "destructive" });
            return;
        }
        if (!selectedPackageId) {
            toast({ title: "Error", description: "Please select a vaccine package", variant: "destructive" });
            return;
        }

        // Check package stock
        const pkg = vaccinePackages.find(p => p.id === selectedPackageId) as any;
        if (pkg && pkg.stock <= 0) {
            toast({
                title: "Insufficient Package Stock",
                description: "This package is out of stock.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            await apiPost('/doctor/package-injection', {
                pet_id: Number(selectedPetId),
                package_id: Number(selectedPackageId),
                cycle_stage: Number(cycleStage),
                notes: notes.trim() || null
            });

            // Reset form
            setSelectedPackageId("");
            setCycleStage("1");
            setNotes("");

            toast({
                title: "Success",
                description: "Package injection saved successfully",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.message || "Failed to save package injection",
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
                                            <span className="font-medium">Breed:</span>
                                            <span>{selectedPet.breed || 'N/A'}</span>
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
