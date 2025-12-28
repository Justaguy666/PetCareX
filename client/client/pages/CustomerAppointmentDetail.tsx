import { Navigate, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Appointment, Pet, User as UserType, Vaccine, VaccinePackage } from "@shared/types";
import {
    ArrowLeft,
    Calendar,
    Clock,
    User,
    Building2,
    Heart,
    Stethoscope,
    Syringe,
    Package,
    FileText,
    X,
    Edit,
    AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CustomerAppointmentDetail() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [pet, setPet] = useState<Pet | null>(null);
    const [vet, setVet] = useState<UserType | null>(null);
    const [vets, setVets] = useState<UserType[]>([]);
    const [vaccine, setVaccine] = useState<Vaccine | null>(null);
    const [vaccinePackage, setVaccinePackage] = useState<VaccinePackage | null>(null);
    const [loading, setLoading] = useState(true);

    // Reschedule modal state
    const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
    const [rescheduleForm, setRescheduleForm] = useState({
        date: "",
        time: "",
        veterinarianId: "",
        notes: "",
    });

    // Cancel modal state
    const [cancelModalOpen, setCancelModalOpen] = useState(false);

    if (!user || user.role !== "customer") {
        return <Navigate to="/login" />;
    }

    useEffect(() => {
        if (id) {
            loadAppointmentDetail(id);
        }
    }, [id]);

    const loadAppointmentDetail = (appointmentId: string) => {
        try {
            const allAppointments = JSON.parse(localStorage.getItem("petcare_appointments") || "[]");
            const foundAppointment = allAppointments.find((a: Appointment) => a.id === appointmentId);

            if (!foundAppointment || foundAppointment.customerId !== user.id) {
                toast({
                    title: "Appointment not found",
                    description: "The requested appointment could not be found.",
                    variant: "destructive",
                });
                navigate("/customer/appointments");
                return;
            }

            setAppointment(foundAppointment);

            // Load pet
            const allPets = JSON.parse(localStorage.getItem("petcare_pets") || "[]");
            const foundPet = allPets.find((p: Pet) => p.id === foundAppointment.petId);
            setPet(foundPet || null);

            // Load all veterinarians
            const allUsers = JSON.parse(localStorage.getItem("petcare_users") || "[]");
            let branchVets = allUsers.filter(
                (u: UserType) => u.role === "veterinarian" && u.branchId === user.branchId
            );

            if (branchVets.length === 0 || !user.branchId) {
                branchVets = allUsers.filter((u: UserType) => u.role === "veterinarian");
            }

            branchVets.sort((a: UserType, b: UserType) => {
                const aSpec = a.specialization || "General";
                const bSpec = b.specialization || "General";
                if (aSpec === "General" && bSpec !== "General") return 1;
                if (aSpec !== "General" && bSpec === "General") return -1;
                return aSpec.localeCompare(bSpec);
            });

            setVets(branchVets);

            // Load veterinarian
            if (foundAppointment.veterinarianId) {
                const foundVet = allUsers.find((u: UserType) => u.id === foundAppointment.veterinarianId);
                setVet(foundVet || null);
            }

            // Load vaccine if single-dose
            if (foundAppointment.serviceType === "single-vaccine") {
                const allVaccines = JSON.parse(localStorage.getItem("petcare_vaccines") || "[]");
                // Extract vaccine name from reasonForVisit
                const vaccineName = foundAppointment.reasonForVisit.replace("Single-Dose Injection: ", "");
                const foundVaccine = allVaccines.find((v: Vaccine) => v.name === vaccineName);
                setVaccine(foundVaccine || null);
            }

            // Load vaccine package if package
            if (foundAppointment.serviceType === "vaccine-package") {
                const allPackages = JSON.parse(localStorage.getItem("petcare_vaccine_packages") || "[]");
                // Extract package name from reasonForVisit
                const packageName = foundAppointment.reasonForVisit.replace("Package Injection: ", "");
                const foundPackage = allPackages.find((p: VaccinePackage) => p.name === packageName);
                setVaccinePackage(foundPackage || null);
            }
        } catch (error) {
            console.error("Error loading appointment detail:", error);
            toast({
                title: "Error",
                description: "Failed to load appointment details.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAppointment = () => {
        setCancelModalOpen(true);
    };

    const handleCancelConfirm = () => {
        if (!appointment) return;

        try {
            const allAppointments = JSON.parse(localStorage.getItem("petcare_appointments") || "[]");
            const updatedAppointments = allAppointments.map((a: Appointment) => {
                if (a.id === appointment.id) {
                    return { ...a, status: "cancelled" as const };
                }
                return a;
            });
            localStorage.setItem("petcare_appointments", JSON.stringify(updatedAppointments));

            toast({
                title: "Appointment cancelled",
                description: "Your appointment has been cancelled successfully.",
            });

            navigate("/customer/appointments");
        } catch (error) {
            console.error("Error cancelling appointment:", error);
            toast({
                title: "Error",
                description: "Failed to cancel appointment.",
                variant: "destructive",
            });
        }
    };

    const openRescheduleModal = () => {
        if (!appointment) return;

        setRescheduleForm({
            date: appointment.appointmentDate,
            time: appointment.appointmentTime,
            veterinarianId: appointment.veterinarianId || "",
            notes: appointment.notes || "",
        });
        setRescheduleModalOpen(true);
    };

    const handleRescheduleSubmit = () => {
        if (!appointment) return;

        if (!rescheduleForm.date || !rescheduleForm.time) {
            toast({
                title: "Missing Information",
                description: "Please select date and time.",
                variant: "destructive",
            });
            return;
        }

        const newDate = new Date(rescheduleForm.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (newDate < today) {
            toast({
                title: "Invalid Date",
                description: "Appointment date must be in the future.",
                variant: "destructive",
            });
            return;
        }

        try {
            const allAppointments = JSON.parse(localStorage.getItem("petcare_appointments") || "[]");
            const updatedAppointments = allAppointments.map((a: Appointment) => {
                if (a.id === appointment.id) {
                    return {
                        ...a,
                        appointmentDate: rescheduleForm.date,
                        appointmentTime: rescheduleForm.time,
                        veterinarianId: rescheduleForm.veterinarianId || a.veterinarianId,
                        notes: rescheduleForm.notes,
                    };
                }
                return a;
            });

            localStorage.setItem("petcare_appointments", JSON.stringify(updatedAppointments));

            toast({
                title: "Appointment rescheduled",
                description: "Your appointment has been rescheduled successfully.",
            });

            setRescheduleModalOpen(false);
            // Reload appointment details
            if (id) loadAppointmentDetail(id);
        } catch (error) {
            console.error("Error rescheduling appointment:", error);
            toast({
                title: "Error",
                description: "Failed to reschedule appointment.",
                variant: "destructive",
            });
        }
    };

    const canReschedule = () => {
        return appointment && (appointment.status === "checked-in" || appointment.status === "pending");
    };

    const canCancel = () => {
        return appointment && (appointment.status === "checked-in" || appointment.status === "pending");
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "confirmed":
                return <Badge className="bg-blue-100 text-blue-700">Confirmed</Badge>;
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
            case "completed":
                return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
            case "cancelled":
                return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getServiceTypeDisplay = (type: string) => {
        switch (type) {
            case "medical-exam":
                return "Medical Exam";
            case "single-vaccine":
                return "Single-Dose Injection";
            case "vaccine-package":
                return "Package Injection";
            default:
                return type;
        }
    };

    const getServiceIcon = (type: string) => {
        switch (type) {
            case "medical-exam":
                return <Stethoscope className="h-5 w-5" />;
            case "single-vaccine":
                return <Syringe className="h-5 w-5" />;
            case "vaccine-package":
                return <Package className="h-5 w-5" />;
            default:
                return <FileText className="h-5 w-5" />;
        }
    };

    const getBranchName = (branchId: string) => {
        try {
            const branches = JSON.parse(localStorage.getItem("petcare_branches") || "[]");
            const branch = branches.find((b: any) => b.id === branchId);
            return branch?.name || "Unknown Branch";
        } catch {
            return "Unknown Branch";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Loading appointment details...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Appointment not found</p>
                        <Button onClick={() => navigate("/customer/booking")} className="mt-4">
                            Back to Bookings
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Back Button */}
                <Button
                    variant="outline"
                    onClick={() => navigate("/customer/appointments")}
                    className="mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to My Appointments
                </Button>

                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-bold">Appointment Details</h1>
                        {getStatusBadge(appointment.status)}
                    </div>
                    <p className="text-muted-foreground">Appointment ID: {appointment.id}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Service Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {getServiceIcon(appointment.serviceType)}
                                    Service Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-muted-foreground">Service Type</Label>
                                    <p className="font-medium text-lg">
                                        {getServiceTypeDisplay(appointment.serviceType)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <Label className="text-muted-foreground">Date</Label>
                                        <p className="font-medium">{formatDate(appointment.appointmentDate)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <Label className="text-muted-foreground">Time</Label>
                                        <p className="font-medium">{appointment.appointmentTime}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <Label className="text-muted-foreground">Branch</Label>
                                        <p className="font-medium">{getBranchName(appointment.branchId)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <Label className="text-muted-foreground">Veterinarian</Label>
                                        <p className="font-medium">
                                            {vet?.fullName || "Not assigned"}
                                            {vet?.specialization && (
                                                <span className="text-sm text-muted-foreground ml-2">
                                                    ({vet.specialization})
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                {appointment.notes && (
                                    <div>
                                        <Label className="text-muted-foreground">Notes</Label>
                                        <p className="text-sm mt-1 p-3 bg-muted rounded-md">{appointment.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Pet Information */}
                        {pet && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Heart className="h-5 w-5" />
                                        Pet Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <Label className="text-muted-foreground">Pet Name</Label>
                                        <p className="font-medium text-lg">{pet.name}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-muted-foreground">Type</Label>
                                            <p className="font-medium capitalize">{pet.type}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Breed</Label>
                                            <p className="font-medium">{pet.breed}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-muted-foreground">Age</Label>
                                            <p className="font-medium">{pet.age} years</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Weight</Label>
                                            <p className="font-medium">{pet.weight} kg</p>
                                        </div>
                                    </div>
                                    {pet.color && (
                                        <div>
                                            <Label className="text-muted-foreground">Color</Label>
                                            <p className="font-medium">{pet.color}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Single-Dose Vaccine Details */}
                        {appointment.serviceType === "single-vaccine" && vaccine && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Syringe className="h-5 w-5" />
                                        Vaccine Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <Label className="text-muted-foreground">Vaccine Name</Label>
                                        <p className="font-medium text-lg">{vaccine.name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Price</Label>
                                        <p className="font-medium text-primary">{formatPrice(vaccine.price)}</p>
                                    </div>
                                    {vaccine.manufacturer && (
                                        <div>
                                            <Label className="text-muted-foreground">Manufacturer</Label>
                                            <p className="font-medium">{vaccine.manufacturer}</p>
                                        </div>
                                    )}
                                    {vaccine.description && (
                                        <div>
                                            <Label className="text-muted-foreground">Description</Label>
                                            <p className="text-sm">{vaccine.description}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Package Vaccine Details */}
                        {appointment.serviceType === "vaccine-package" && vaccinePackage && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Vaccine Package Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-muted-foreground">Package Name</Label>
                                        <p className="font-medium text-lg">{vaccinePackage.name}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-muted-foreground">Price</Label>
                                            <p className="font-medium text-primary">
                                                {formatPrice(vaccinePackage.price)}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Month Cycle</Label>
                                            <p className="font-medium">{vaccinePackage.monthMark} months</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Cycles</Label>
                                        <p className="font-medium">{vaccinePackage.cycle} cycle(s)</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground mb-2 block">Vaccines Included</Label>
                                        <div className="space-y-2">
                                            {vaccinePackage.vaccines.map((v, index) => {
                                                const allVaccines = JSON.parse(localStorage.getItem("petcare_vaccines") || "[]");
                                                const vaccine = allVaccines.find((vac: Vaccine) => vac.id === v.vaccineId);
                                                return (
                                                    <div
                                                        key={index}
                                                        className="p-3 bg-muted rounded-md border border-border"
                                                    >
                                                        <p className="font-medium">{vaccine?.name || 'Unknown Vaccine'}</p>
                                                        <p className="text-sm text-muted-foreground">Dosage: {v.dosage} ml</p>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    {vaccinePackage.description && (
                                        <div>
                                            <Label className="text-muted-foreground">Description</Label>
                                            <p className="text-sm">{vaccinePackage.description}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Medical Exam Info */}
                        {appointment.serviceType === "medical-exam" && (
                            <Card className="border-blue-200 bg-blue-50">
                                <CardHeader>
                                    <CardTitle className="text-blue-900">Medical Examination</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-blue-700">
                                        This is a comprehensive health check-up that includes:
                                    </p>
                                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-blue-700">
                                        <li>Physical examination</li>
                                        <li>Vital signs check</li>
                                        <li>General health assessment</li>
                                        <li>Consultation with veterinarian</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* Action Buttons */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Appointment Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {canReschedule() && (
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                        onClick={openRescheduleModal}
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Reschedule Appointment
                                    </Button>
                                )}
                                {canCancel() && (
                                    <Button
                                        className="w-full"
                                        variant="destructive"
                                        onClick={handleCancelAppointment}
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel Appointment
                                    </Button>
                                )}
                                {appointment.status === "completed" && (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-muted-foreground">
                                            This appointment has been completed. Check "My Services" to view the service
                                            history and leave a rating.
                                        </p>
                                        <Button
                                            variant="outline"
                                            className="mt-4 w-full"
                                            onClick={() => navigate("/customer/services")}
                                        >
                                            View Service History
                                        </Button>
                                    </div>
                                )}
                                {appointment.status === "cancelled" && (
                                    <p className="text-sm text-muted-foreground text-center py-2">
                                        This appointment has been cancelled.
                                    </p>
                                )}
                                {appointment.status === "pending" && (
                                    <p className="text-sm text-yellow-700 text-center py-2">
                                        You have checked in. Please wait for the veterinarian.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Reschedule Modal */}
                <Dialog open={rescheduleModalOpen} onOpenChange={setRescheduleModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Reschedule Appointment</DialogTitle>
                            <DialogDescription>
                                Choose a new date and time for your appointment
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="reschedule-date">
                                    New Date <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="reschedule-date"
                                    type="date"
                                    value={rescheduleForm.date}
                                    onChange={(e) =>
                                        setRescheduleForm({ ...rescheduleForm, date: e.target.value })
                                    }
                                    min={new Date().toISOString().split("T")[0]}
                                />
                            </div>
                            <div>
                                <Label htmlFor="reschedule-time">
                                    New Time <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="reschedule-time"
                                    type="time"
                                    value={rescheduleForm.time}
                                    onChange={(e) =>
                                        setRescheduleForm({ ...rescheduleForm, time: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="reschedule-vet">Veterinarian (Optional)</Label>
                                <Select
                                    value={rescheduleForm.veterinarianId}
                                    onValueChange={(value) =>
                                        setRescheduleForm({ ...rescheduleForm, veterinarianId: value })
                                    }
                                >
                                    <SelectTrigger id="reschedule-vet">
                                        <SelectValue placeholder="Keep current veterinarian" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vets.map((vet) => (
                                            <SelectItem key={vet.id} value={vet.id}>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {vet.fullName} - {vet.specialization || "General Veterinarian"}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {vet.phone && `Tel: ${vet.phone}`}
                                                        {vet.licenseNumber && ` | License: ${vet.licenseNumber}`}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="reschedule-notes">Notes (Optional)</Label>
                                <Textarea
                                    id="reschedule-notes"
                                    value={rescheduleForm.notes}
                                    onChange={(e) =>
                                        setRescheduleForm({ ...rescheduleForm, notes: e.target.value })
                                    }
                                    placeholder="Any special requests or notes..."
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setRescheduleModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleRescheduleSubmit}>
                                Reschedule Appointment
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Cancel Confirmation Modal */}
                <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                Cancel Appointment
                            </DialogTitle>
                            <DialogDescription>
                                Are you sure you want to cancel this appointment? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        {appointment && (
                            <div className="py-4 space-y-2">
                                <p className="text-sm">
                                    <strong>Date:</strong> {formatDate(appointment.appointmentDate)}
                                </p>
                                <p className="text-sm">
                                    <strong>Time:</strong> {appointment.appointmentTime}
                                </p>
                                <p className="text-sm">
                                    <strong>Service:</strong> {getServiceTypeDisplay(appointment.serviceType)}
                                </p>
                            </div>
                        )}
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setCancelModalOpen(false)}
                            >
                                Keep Appointment
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleCancelConfirm}
                            >
                                Yes, Cancel Appointment
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
