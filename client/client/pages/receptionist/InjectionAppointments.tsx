import ReceptionHeader from "@/components/ReceptionHeader";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Syringe, Package, Calendar, User, PawPrint, Clock, Edit, X } from "lucide-react";
import type { Pet, Vaccine, VaccinePackage, User as UserType, Appointment } from "@shared/types";

interface InjectionAppointment extends Appointment {
    type?: "single-dose" | "package";
    vaccineId?: string;
    vaccineName?: string;
    packageId?: string;
    packageName?: string;
    petName?: string;
    customerName?: string;
    veterinarianName?: string;
}

export default function InjectionAppointments() {
    const { user } = useAuth();
    const { toast } = useToast();

    // State
    const [pets, setPets] = useState<Pet[]>([]);
    const [customers, setCustomers] = useState<UserType[]>([]);
    const [vaccines, setVaccines] = useState<Vaccine[]>([]);
    const [vaccinePackages, setVaccinePackages] = useState<VaccinePackage[]>([]);
    const [veterinarians, setVeterinarians] = useState<UserType[]>([]);
    const [appointments, setAppointments] = useState<InjectionAppointment[]>([]);

    // Single-Dose Form State
    const [singleForm, setSingleForm] = useState({
        customerId: "",
        petId: "",
        vaccineId: "",
        date: "",
        time: "",
        veterinarianId: "",
        notes: "",
    });

    // Package Form State
    const [packageForm, setPackageForm] = useState({
        customerId: "",
        petId: "",
        packageId: "",
        date: "",
        time: "",
        veterinarianId: "",
        notes: "",
    });

    const [isLoading, setIsLoading] = useState(false);

    // Redirect if not authenticated
    if (!user || user.role !== "receptionist") {
        return <Navigate to="/login" />;
    }

    // Load data
    useEffect(() => {
        const loadedPets = JSON.parse(localStorage.getItem("petcare_pets") || "[]");
        const loadedUsers = JSON.parse(localStorage.getItem("petcare_users") || "[]");
        const loadedVaccines = JSON.parse(localStorage.getItem("petcare_vaccines") || "[]");
        const loadedPackages = JSON.parse(localStorage.getItem("petcare_vaccine_packages") || "[]");
        const loadedAppointments = JSON.parse(localStorage.getItem("petcare_appointments") || "[]");

        setPets(loadedPets);
        setCustomers(loadedUsers.filter((u: UserType) => u.role === "customer"));
        setVaccines(loadedVaccines);
        setVaccinePackages(loadedPackages);
        setVeterinarians(loadedUsers.filter((u: UserType) => u.role === "veterinarian" && u.branchId === user.branchId));

        // Filter injection appointments
        const injectionAppts = loadedAppointments.filter(
            (apt: InjectionAppointment) => apt.type === "single-dose" || apt.type === "package"
        );
        setAppointments(injectionAppts);
    }, [user.branchId]);

    // Get customer pets
    const getCustomerPets = (customerId: string) => {
        return pets.filter((p) => p.customerId === customerId);
    };

    // Get selected vaccine details
    const selectedVaccine = vaccines.find((v) => v.id === singleForm.vaccineId);
    const selectedPackage = vaccinePackages.find((p) => p.id === packageForm.packageId);

    // Get vaccine details for package
    const getVaccineDetails = (vaccineId: string) => {
        return vaccines.find((v) => v.id === vaccineId);
    };

    // Handle Single-Dose Appointment Submit
    const handleSingleDoseSubmit = () => {
        // Validation
        if (!singleForm.customerId) {
            toast({ title: "Error", description: "Please select a customer", variant: "destructive" });
            return;
        }
        if (!singleForm.petId) {
            toast({ title: "Error", description: "Please select a pet", variant: "destructive" });
            return;
        }
        if (!singleForm.vaccineId) {
            toast({ title: "Error", description: "Please select a vaccine", variant: "destructive" });
            return;
        }
        if (!singleForm.date || !singleForm.time) {
            toast({ title: "Error", description: "Please select date and time", variant: "destructive" });
            return;
        }
        if (!singleForm.veterinarianId) {
            toast({ title: "Error", description: "Please select a veterinarian", variant: "destructive" });
            return;
        }

        setIsLoading(true);

        try {
            const pet = pets.find((p) => p.id === singleForm.petId);
            const customer = customers.find((c) => c.id === singleForm.customerId);
            const vaccine = vaccines.find((v) => v.id === singleForm.vaccineId);
            const vet = veterinarians.find((v) => v.id === singleForm.veterinarianId);

            const newAppointment: InjectionAppointment = {
                id: `apt-inj-${Date.now()}`,
                type: "single-dose",
                petId: singleForm.petId,
                petName: pet?.name || "Unknown",
                customerId: singleForm.customerId,
                customerName: customer?.fullName || "Unknown",
                veterinarianId: singleForm.veterinarianId,
                veterinarianName: vet?.fullName || "Unknown",
                vaccineId: singleForm.vaccineId,
                vaccineName: vaccine?.name || "Unknown",
                branchId: user.branchId || "",
                appointmentDate: singleForm.date,
                appointmentTime: singleForm.time,
                serviceType: "injection",
                status: "pending",
                reasonForVisit: `Single-Dose Injection: ${vaccine?.name}`,
                notes: singleForm.notes,
                createdAt: new Date().toISOString(),
            };

            const allAppointments = JSON.parse(localStorage.getItem("petcare_appointments") || "[]");
            const updatedAppointments = [...allAppointments, newAppointment];
            localStorage.setItem("petcare_appointments", JSON.stringify(updatedAppointments));

            setAppointments([...appointments, newAppointment]);

            // Reset form
            setSingleForm({
                customerId: "",
                petId: "",
                vaccineId: "",
                date: "",
                time: "",
                veterinarianId: "",
                notes: "",
            });

            toast({
                title: "Success",
                description: "Single-dose injection appointment created successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create appointment",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Package Appointment Submit
    const handlePackageSubmit = () => {
        // Validation
        if (!packageForm.customerId) {
            toast({ title: "Error", description: "Please select a customer", variant: "destructive" });
            return;
        }
        if (!packageForm.petId) {
            toast({ title: "Error", description: "Please select a pet", variant: "destructive" });
            return;
        }
        if (!packageForm.packageId) {
            toast({ title: "Error", description: "Please select a vaccine package", variant: "destructive" });
            return;
        }
        if (!packageForm.date || !packageForm.time) {
            toast({ title: "Error", description: "Please select date and time", variant: "destructive" });
            return;
        }
        if (!packageForm.veterinarianId) {
            toast({ title: "Error", description: "Please select a veterinarian", variant: "destructive" });
            return;
        }

        setIsLoading(true);

        try {
            const pet = pets.find((p) => p.id === packageForm.petId);
            const customer = customers.find((c) => c.id === packageForm.customerId);
            const pkg = vaccinePackages.find((p) => p.id === packageForm.packageId);
            const vet = veterinarians.find((v) => v.id === packageForm.veterinarianId);

            const newAppointment: InjectionAppointment = {
                id: `apt-pkg-${Date.now()}`,
                type: "package",
                petId: packageForm.petId,
                petName: pet?.name || "Unknown",
                customerId: packageForm.customerId,
                customerName: customer?.fullName || "Unknown",
                veterinarianId: packageForm.veterinarianId,
                veterinarianName: vet?.fullName || "Unknown",
                packageId: packageForm.packageId,
                packageName: pkg?.name || "Unknown",
                branchId: user.branchId || "",
                appointmentDate: packageForm.date,
                appointmentTime: packageForm.time,
                serviceType: "injection",
                status: "pending",
                reasonForVisit: `Package Injection: ${pkg?.name}`,
                notes: packageForm.notes,
                createdAt: new Date().toISOString(),
            };

            const allAppointments = JSON.parse(localStorage.getItem("petcare_appointments") || "[]");
            const updatedAppointments = [...allAppointments, newAppointment];
            localStorage.setItem("petcare_appointments", JSON.stringify(updatedAppointments));

            setAppointments([...appointments, newAppointment]);

            // Reset form
            setPackageForm({
                customerId: "",
                petId: "",
                packageId: "",
                date: "",
                time: "",
                veterinarianId: "",
                notes: "",
            });

            toast({
                title: "Success",
                description: "Package injection appointment created successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create appointment",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Cancel Appointment
    const handleCancelAppointment = (id: string) => {
        if (!confirm("Are you sure you want to cancel this appointment?")) return;

        const allAppointments = JSON.parse(localStorage.getItem("petcare_appointments") || "[]");
        const updatedAppointments = allAppointments.filter((apt: InjectionAppointment) => apt.id !== id);
        localStorage.setItem("petcare_appointments", JSON.stringify(updatedAppointments));

        setAppointments(appointments.filter((apt) => apt.id !== id));

        toast({
            title: "Cancelled",
            description: "Appointment has been cancelled",
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <ReceptionHeader />

            <main className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Injection Appointments</h1>
                    <p className="text-muted-foreground">Book single-dose and package injection appointments</p>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="single" className="space-y-6">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="single" className="flex items-center gap-2">
                            <Syringe className="w-4 h-4" />
                            Single-Dose
                        </TabsTrigger>
                        <TabsTrigger value="package" className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Package
                        </TabsTrigger>
                    </TabsList>

                    {/* Single-Dose Tab */}
                    <TabsContent value="single">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Syringe className="w-5 h-5" />
                                    Single-Dose Injection Booking
                                </CardTitle>
                                <CardDescription>Book an appointment for a single vaccine dose</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Customer Selection */}
                                    <div>
                                        <Label>Customer *</Label>
                                        <Select
                                            value={singleForm.customerId}
                                            onValueChange={(value) => {
                                                setSingleForm({ ...singleForm, customerId: value, petId: "" });
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select customer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {customers.map((customer) => (
                                                    <SelectItem key={customer.id} value={customer.id}>
                                                        {customer.fullName} - {customer.phone || customer.email}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Pet Selection */}
                                    <div>
                                        <Label>Pet *</Label>
                                        <Select
                                            value={singleForm.petId}
                                            onValueChange={(value) => setSingleForm({ ...singleForm, petId: value })}
                                            disabled={!singleForm.customerId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select pet" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getCustomerPets(singleForm.customerId).map((pet) => (
                                                    <SelectItem key={pet.id} value={pet.id}>
                                                        {pet.name} ({pet.type})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Vaccine Selection */}
                                    <div>
                                        <Label>Vaccine *</Label>
                                        <Select
                                            value={singleForm.vaccineId}
                                            onValueChange={(value) => setSingleForm({ ...singleForm, vaccineId: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select vaccine" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {vaccines.map((vaccine) => (
                                                    <SelectItem key={vaccine.id} value={vaccine.id}>
                                                        {vaccine.name} - {vaccine.price.toLocaleString()} VND
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Veterinarian Selection */}
                                    <div>
                                        <Label>Veterinarian *</Label>
                                        <Select
                                            value={singleForm.veterinarianId}
                                            onValueChange={(value) => setSingleForm({ ...singleForm, veterinarianId: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select veterinarian" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {veterinarians.map((vet) => (
                                                    <SelectItem key={vet.id} value={vet.id}>
                                                        Dr. {vet.fullName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <Label>Date *</Label>
                                        <Input
                                            type="date"
                                            value={singleForm.date}
                                            onChange={(e) => setSingleForm({ ...singleForm, date: e.target.value })}
                                            min={new Date().toISOString().split("T")[0]}
                                        />
                                    </div>

                                    {/* Time */}
                                    <div>
                                        <Label>Time *</Label>
                                        <Input
                                            type="time"
                                            value={singleForm.time}
                                            onChange={(e) => setSingleForm({ ...singleForm, time: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Vaccine Details */}
                                {selectedVaccine && (
                                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg space-y-2">
                                        <h4 className="font-medium">Vaccine Details</h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Manufacturer:</span>
                                                <span className="ml-2">{selectedVaccine.manufacturer || "N/A"}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Price:</span>
                                                <span className="ml-2">{selectedVaccine.price.toLocaleString()} VND</span>
                                            </div>
                                            {selectedVaccine.description && (
                                                <div className="col-span-2">
                                                    <span className="text-muted-foreground">Description:</span>
                                                    <p className="mt-1">{selectedVaccine.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                <div>
                                    <Label>Notes (Optional)</Label>
                                    <Textarea
                                        value={singleForm.notes}
                                        onChange={(e) => setSingleForm({ ...singleForm, notes: e.target.value })}
                                        placeholder="Any additional notes..."
                                        rows={3}
                                    />
                                </div>

                                {/* Submit Button */}
                                <Button
                                    onClick={handleSingleDoseSubmit}
                                    disabled={isLoading}
                                    className="w-full"
                                    size="lg"
                                >
                                    <Syringe className="w-4 h-4 mr-2" />
                                    {isLoading ? "Booking..." : "Book Single-Dose Appointment"}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Package Tab */}
                    <TabsContent value="package">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Package Injection Booking
                                </CardTitle>
                                <CardDescription>Book an appointment for a vaccine package</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Customer Selection */}
                                    <div>
                                        <Label>Customer *</Label>
                                        <Select
                                            value={packageForm.customerId}
                                            onValueChange={(value) => {
                                                setPackageForm({ ...packageForm, customerId: value, petId: "" });
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select customer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {customers.map((customer) => (
                                                    <SelectItem key={customer.id} value={customer.id}>
                                                        {customer.fullName} - {customer.phone || customer.email}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Pet Selection */}
                                    <div>
                                        <Label>Pet *</Label>
                                        <Select
                                            value={packageForm.petId}
                                            onValueChange={(value) => setPackageForm({ ...packageForm, petId: value })}
                                            disabled={!packageForm.customerId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select pet" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getCustomerPets(packageForm.customerId).map((pet) => (
                                                    <SelectItem key={pet.id} value={pet.id}>
                                                        {pet.name} ({pet.type})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Package Selection */}
                                    <div>
                                        <Label>Vaccine Package *</Label>
                                        <Select
                                            value={packageForm.packageId}
                                            onValueChange={(value) => setPackageForm({ ...packageForm, packageId: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select package" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {vaccinePackages.map((pkg) => (
                                                    <SelectItem key={pkg.id} value={pkg.id}>
                                                        {pkg.name} - Month {pkg.monthMark} - {pkg.price.toLocaleString()} VND
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Veterinarian Selection */}
                                    <div>
                                        <Label>Veterinarian *</Label>
                                        <Select
                                            value={packageForm.veterinarianId}
                                            onValueChange={(value) => setPackageForm({ ...packageForm, veterinarianId: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select veterinarian" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {veterinarians.map((vet) => (
                                                    <SelectItem key={vet.id} value={vet.id}>
                                                        Dr. {vet.fullName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <Label>Date *</Label>
                                        <Input
                                            type="date"
                                            value={packageForm.date}
                                            onChange={(e) => setPackageForm({ ...packageForm, date: e.target.value })}
                                            min={new Date().toISOString().split("T")[0]}
                                        />
                                    </div>

                                    {/* Time */}
                                    <div>
                                        <Label>Time *</Label>
                                        <Input
                                            type="time"
                                            value={packageForm.time}
                                            onChange={(e) => setPackageForm({ ...packageForm, time: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Package Details */}
                                {selectedPackage && (
                                    <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg space-y-3">
                                        <h4 className="font-medium">Package Details</h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Month Mark:</span>
                                                <Badge className="ml-2">{selectedPackage.monthMark} months</Badge>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Cycle:</span>
                                                <span className="ml-2">{selectedPackage.cycle} times</span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-muted-foreground">Price:</span>
                                                <span className="ml-2 font-medium">
                                                    {selectedPackage.price.toLocaleString()} VND
                                                </span>
                                            </div>
                                        </div>

                                        {/* Vaccines in Package */}
                                        <div>
                                            <h5 className="font-medium mb-2">Vaccines Included:</h5>
                                            <div className="space-y-2">
                                                {selectedPackage.vaccines.map((pkgVaccine) => {
                                                    const vaccine = getVaccineDetails(pkgVaccine.vaccineId);
                                                    return (
                                                        <div
                                                            key={pkgVaccine.vaccineId}
                                                            className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border"
                                                        >
                                                            <span className="text-sm">{vaccine?.name || "Unknown"}</span>
                                                            <Badge variant="outline">{pkgVaccine.dosage} dose(s)</Badge>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {selectedPackage.description && (
                                            <div>
                                                <span className="text-muted-foreground">Description:</span>
                                                <p className="mt-1 text-sm">{selectedPackage.description}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Notes */}
                                <div>
                                    <Label>Notes (Optional)</Label>
                                    <Textarea
                                        value={packageForm.notes}
                                        onChange={(e) => setPackageForm({ ...packageForm, notes: e.target.value })}
                                        placeholder="Any additional notes..."
                                        rows={3}
                                    />
                                </div>

                                {/* Submit Button */}
                                <Button
                                    onClick={handlePackageSubmit}
                                    disabled={isLoading}
                                    className="w-full"
                                    size="lg"
                                >
                                    <Package className="w-4 h-4 mr-2" />
                                    {isLoading ? "Booking..." : "Book Package Appointment"}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Upcoming Appointments Table */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Upcoming Injection Appointments</CardTitle>
                        <CardDescription>View and manage scheduled injection appointments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Appointment ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Pet</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Date / Time</TableHead>
                                    <TableHead>Veterinarian</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {appointments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                                            No injection appointments scheduled
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    appointments.map((apt) => (
                                        <TableRow key={apt.id}>
                                            <TableCell className="font-mono text-sm">{apt.id}</TableCell>
                                            <TableCell>{apt.customerName}</TableCell>
                                            <TableCell>{apt.petName}</TableCell>
                                            <TableCell>
                                                <Badge variant={apt.type === "single-dose" ? "default" : "secondary"}>
                                                    {apt.type === "single-dose" ? "Single" : "Package"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {apt.type === "single-dose" ? apt.vaccineName : apt.packageName}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {apt.appointmentDate}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-muted-foreground">
                                                        <Clock className="w-3 h-3" />
                                                        {apt.appointmentTime}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{apt.veterinarianName}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        apt.status === "completed"
                                                            ? "secondary"
                                                            : apt.status === "checked-in"
                                                                ? "default"
                                                                : "outline"
                                                    }
                                                >
                                                    {apt.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button size="sm" variant="outline" disabled>
                                                        <Edit className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleCancelAppointment(apt.id)}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
