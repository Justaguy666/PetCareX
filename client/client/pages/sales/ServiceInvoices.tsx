import SalesHeader from "@/components/SalesHeader";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { FileText, Plus, X, Eye, Star, DollarSign, User, PawPrint, Syringe, Package as PackageIcon } from "lucide-react";
import type { ServiceInstance, ServiceInvoice, User as UserType, Pet, GlobalPromotion, BranchPromotion, ServiceType } from "@shared/types";
import { isEligibleForPromotion } from "@/lib/membershipUtils";

export default function ServiceInvoices() {
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    // State
    const [serviceInstances, setServiceInstances] = useState<ServiceInstance[]>([]);
    const [invoices, setInvoices] = useState<ServiceInvoice[]>([]);
    const [customers, setCustomers] = useState<UserType[]>([]);
    const [pets, setPets] = useState<Pet[]>([]);
    const [globalPromotions, setGlobalPromotions] = useState<GlobalPromotion[]>([]);
    const [branchPromotions, setBranchPromotions] = useState<BranchPromotion[]>([]);
    const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);

    // Invoice form state
    const [showInvoiceForm, setShowInvoiceForm] = useState(false);
    const [selectedService, setSelectedService] = useState<ServiceInstance | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Bank transfer">("Cash");
    const [staffAttitudeRating, setStaffAttitudeRating] = useState(5);
    const [overallSatisfaction, setOverallSatisfaction] = useState(5);
    const [notes, setNotes] = useState("");

    if (!user || user.role !== "sales") return <Navigate to="/login" />;

    // Load data
    useEffect(() => {
        const loadedServices = JSON.parse(localStorage.getItem("petcare_service_instances") || "[]");
        const loadedInvoices = JSON.parse(localStorage.getItem("petcare_service_invoices") || "[]");
        const loadedUsers = JSON.parse(localStorage.getItem("petcare_users") || "[]");
        const loadedPets = JSON.parse(localStorage.getItem("petcare_pets") || "[]");
        const loadedGlobalPromotions = JSON.parse(localStorage.getItem("petcare_global_promotions") || "[]");
        const loadedBranchPromotions = JSON.parse(localStorage.getItem("petcare_branch_promotions") || "[]");
        const loadedServiceTypes = JSON.parse(localStorage.getItem("petcare_service_types") || "[]");

        // Filter uninvoiced services for this branch
        const uninvoiced = loadedServices.filter(
            (s: ServiceInstance) => !s.invoiceId && s.branchId === user.branchId
        );

        setServiceInstances(uninvoiced);
        setInvoices(loadedInvoices.filter((inv: ServiceInvoice) => inv.branchId === user.branchId));
        setCustomers(loadedUsers.filter((u: UserType) => u.role === "customer"));
        setPets(loadedPets);
        setGlobalPromotions(loadedGlobalPromotions.filter((p: GlobalPromotion) => p.isActive));
        setBranchPromotions(
            loadedBranchPromotions.filter(
                (p: BranchPromotion) => p.isActive && p.branchId === user.branchId
            )
        );
        setServiceTypes(loadedServiceTypes);
    }, [user.branchId]);

    // Get customer details
    const getCustomer = (customerId: string) => {
        return customers.find((c) => c.id === customerId);
    };

    // Get pet details
    const getPet = (petId: string) => {
        return pets.find((p) => p.id === petId);
    };

    // Get service type details
    const getServiceType = (serviceTypeId: string) => {
        return serviceTypes.find((st) => st.id === serviceTypeId);
    };

    // Calculate eligible promotions
    const calculatePromotions = (service: ServiceInstance) => {
        const customer = getCustomer(service.customerId);
        if (!customer) return { eligiblePromotions: [], totalDiscount: 0, discountRate: 0 };

        const today = new Date();
        const eligiblePromotions: (GlobalPromotion | BranchPromotion)[] = [];

        // Check global promotions
        globalPromotions.forEach((promo) => {
            const startDate = new Date(promo.startDate);
            const endDate = new Date(promo.endDate);

            if (today >= startDate && today <= endDate) {
                // Check membership eligibility using the new membership system
                let membershipEligible = false;
                if (promo.targetAudience === "All") {
                    membershipEligible = true;
                } else if (promo.targetAudience === "Loyal+") {
                    // Loyal+ means Loyal or VIP
                    membershipEligible = isEligibleForPromotion(customer.membershipLevel || "Cơ bản", "Thân thiết");
                } else if (promo.targetAudience === "VIP+") {
                    // VIP+ means only VIP
                    membershipEligible = isEligibleForPromotion(customer.membershipLevel || "Cơ bản", "VIP");
                }

                // Check service type
                const serviceTypeMatch = promo.applicableServiceTypes.includes(service.serviceType);

                if (membershipEligible && serviceTypeMatch) {
                    eligiblePromotions.push(promo);
                }
            }
        });

        // Check branch promotions
        branchPromotions.forEach((promo) => {
            const startDate = new Date(promo.startDate);
            const endDate = new Date(promo.endDate);

            if (today >= startDate && today <= endDate) {
                // Check membership eligibility using the new membership system
                let membershipEligible = false;
                if (promo.targetAudience === "All") {
                    membershipEligible = true;
                } else if (promo.targetAudience === "Loyal+") {
                    // Loyal+ means Loyal or VIP
                    membershipEligible = isEligibleForPromotion(customer.membershipLevel || "Cơ bản", "Thân thiết");
                } else if (promo.targetAudience === "VIP+") {
                    // VIP+ means only VIP
                    membershipEligible = isEligibleForPromotion(customer.membershipLevel || "Cơ bản", "VIP");
                }

                const serviceTypeMatch = promo.applicableServiceTypes.includes(service.serviceType);

                if (membershipEligible && serviceTypeMatch) {
                    eligiblePromotions.push(promo);
                }
            }
        });

        // Calculate total discount rate (sum all eligible promotions)
        const totalDiscountRate = eligiblePromotions.reduce((sum, promo) => sum + promo.discountRate, 0);

        return { eligiblePromotions, totalDiscount: 0, discountRate: Math.min(totalDiscountRate, 50) }; // Cap at 50%
    };

    // Calculate invoice totals
    const calculateInvoiceTotals = (service: ServiceInstance) => {
        const subtotal = service.basePrice + (service.vaccineCost || 0) + (service.packageCost || 0);
        const { discountRate } = calculatePromotions(service);
        const discountAmount = Math.floor(subtotal * (discountRate / 100));
        const total = subtotal - discountAmount;

        return { subtotal, discountRate, discountAmount, total };
    };

    // Handle create invoice button click
    const handleCreateInvoiceClick = (service: ServiceInstance) => {
        setSelectedService(service);
        setShowInvoiceForm(true);
        setPaymentMethod("Cash");
        setStaffAttitudeRating(5);
        setOverallSatisfaction(5);
        setNotes("");
    };

    // Handle complete invoice
    const handleCompleteInvoice = () => {
        if (!selectedService) return;

        const customer = getCustomer(selectedService.customerId);
        if (!customer) {
            toast({ title: "Error", description: "Customer not found", variant: "destructive" });
            return;
        }

        const { subtotal, discountRate, discountAmount, total } = calculateInvoiceTotals(selectedService);
        const { eligiblePromotions } = calculatePromotions(selectedService);

        // Calculate loyalty points
        const loyaltyPointsEarned = Math.floor(total / 50000);

        // Create invoice
        const newInvoice: ServiceInvoice = {
            id: `sinv-${Date.now()}`,
            customerId: selectedService.customerId,
            customerName: selectedService.customerName,
            branchId: user.branchId || "",
            salesStaffId: user.id,
            salesStaffName: user.fullName,
            serviceInstanceIds: [selectedService.id],
            subtotal,
            discount: discountAmount,
            discountRate,
            total,
            paymentMethod,
            staffAttitudeRating,
            overallSatisfaction,
            loyaltyPointsEarned,
            appliedPromotions: eligiblePromotions.map((p) => p.id),
            notes,
            createdAt: new Date().toISOString(),
        };

        // Update service instance with invoiceId
        const allServices = JSON.parse(localStorage.getItem("petcare_service_instances") || "[]");
        const updatedServices = allServices.map((s: ServiceInstance) =>
            s.id === selectedService.id ? { ...s, invoiceId: newInvoice.id } : s
        );
        localStorage.setItem("petcare_service_instances", JSON.stringify(updatedServices));

        // Save invoice
        const allInvoices = JSON.parse(localStorage.getItem("petcare_service_invoices") || "[]");
        allInvoices.push(newInvoice);
        localStorage.setItem("petcare_service_invoices", JSON.stringify(allInvoices));

        // Update customer loyalty points
        const allUsers = JSON.parse(localStorage.getItem("petcare_users") || "[]");
        const updatedUsers = allUsers.map((u: UserType) =>
            u.id === customer.id
                ? { ...u, loyaltyPoints: (u.loyaltyPoints || 0) + loyaltyPointsEarned }
                : u
        );
        localStorage.setItem("petcare_users", JSON.stringify(updatedUsers));

        // Update state
        setServiceInstances(serviceInstances.filter((s) => s.id !== selectedService.id));
        setInvoices([...invoices, newInvoice]);

        toast({
            title: "Success",
            description: `Invoice created successfully. ${loyaltyPointsEarned} loyalty points awarded.`,
        });

        setShowInvoiceForm(false);
        setSelectedService(null);
    };

    // Get service type display name
    const getServiceTypeDisplay = (serviceType: string) => {
        switch (serviceType) {
            case "single-vaccine":
                return "Single-Dose Injection";
            case "vaccine-package":
                return "Package Injection";
            case "medical-exam":
                return "Medical Exam";
            case "purchase":
                return "Purchase";
            default:
                return serviceType;
        }
    };

    // Get service type icon
    const getServiceTypeIcon = (serviceType: string) => {
        switch (serviceType) {
            case "single-vaccine":
                return <Syringe className="w-4 h-4" />;
            case "vaccine-package":
                return <PackageIcon className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <SalesHeader />

            <main className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Service Invoices</h1>
                    <p className="text-muted-foreground">
                        Create invoices for completed veterinary services
                    </p>
                </div>

                {/* Invoice Form Modal */}
                {showInvoiceForm && selectedService && (
                    <Card className="mb-6 border-2 border-primary">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Create Service Invoice
                                </CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => setShowInvoiceForm(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <CardDescription>Complete invoice for {selectedService.customerName}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Customer & Pet Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                <div>
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Customer Information
                                    </h3>
                                    <div className="space-y-1 text-sm">
                                        <p>
                                            <span className="text-muted-foreground">Name:</span>{" "}
                                            <span className="font-medium">{selectedService.customerName}</span>
                                        </p>
                                        <p>
                                            <span className="text-muted-foreground">Phone:</span>{" "}
                                            {getCustomer(selectedService.customerId)?.phone || "N/A"}
                                        </p>
                                        <p>
                                            <span className="text-muted-foreground">Membership:</span>{" "}
                                            <Badge variant="secondary">
                                                {getCustomer(selectedService.customerId)?.membershipLevel || "Cơ bản"}
                                            </Badge>
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <PawPrint className="w-4 h-4" />
                                        Pet Information
                                    </h3>
                                    <div className="space-y-1 text-sm">
                                        <p>
                                            <span className="text-muted-foreground">Name:</span>{" "}
                                            <span className="font-medium">{selectedService.petName}</span>
                                        </p>
                                        <p>
                                            <span className="text-muted-foreground">Type:</span>{" "}
                                            {getPet(selectedService.petId)?.type || "N/A"}
                                        </p>
                                        <p>
                                            <span className="text-muted-foreground">Breed:</span>{" "}
                                            {getPet(selectedService.petId)?.breed || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Service Details */}
                            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                                <h3 className="font-semibold mb-3">Service Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Service Type:</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            {getServiceTypeIcon(selectedService.serviceType)}
                                            <Badge>{getServiceTypeDisplay(selectedService.serviceType)}</Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Veterinarian:</span>
                                        <p className="font-medium mt-1">Dr. {selectedService.veterinarianName}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Date:</span>
                                        <p className="font-medium mt-1">
                                            {new Date(selectedService.datePerformed).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {selectedService.packageId && (
                                        <div className="col-span-2">
                                            <span className="text-muted-foreground">Vaccines Administered:</span>
                                            <div className="mt-1 space-y-1">
                                                {selectedService.vaccinesUsed.map((vaccine, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-xs">
                                                        <Badge variant="outline">{vaccine.vaccineName}</Badge>
                                                        <span className="text-muted-foreground">
                                                            {vaccine.dosage} dose(s)
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Cost Breakdown */}
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    Cost Breakdown
                                </h3>
                                <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Base Service Price:</span>
                                        <span className="font-medium">{selectedService.basePrice.toLocaleString()} VND</span>
                                    </div>
                                    {selectedService.vaccineCost && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Vaccine Cost:</span>
                                            <span className="font-medium">
                                                {selectedService.vaccineCost.toLocaleString()} VND
                                            </span>
                                        </div>
                                    )}
                                    {selectedService.packageCost && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Package Cost:</span>
                                            <span className="font-medium">
                                                {selectedService.packageCost.toLocaleString()} VND
                                            </span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between text-sm font-medium">
                                        <span>Subtotal:</span>
                                        <span>{calculateInvoiceTotals(selectedService).subtotal.toLocaleString()} VND</span>
                                    </div>
                                </div>
                            </div>

                            {/* Applied Promotions */}
                            {(() => {
                                const { eligiblePromotions, discountRate } = calculatePromotions(selectedService);
                                const { discountAmount } = calculateInvoiceTotals(selectedService);

                                return eligiblePromotions.length > 0 ? (
                                    <div>
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <Badge className="w-4 h-4" />
                                            Applied Promotions
                                        </h3>
                                        <div className="space-y-2">
                                            {eligiblePromotions.map((promo) => (
                                                <div
                                                    key={promo.id}
                                                    className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox checked disabled />
                                                        <div>
                                                            <p className="text-sm font-medium">{promo.description}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {promo.targetAudience} • {promo.discountRate}% off
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex justify-between p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                                <span className="font-medium">Total Discount ({discountRate}%):</span>
                                                <span className="font-bold text-purple-600 dark:text-purple-400">
                                                    -{discountAmount.toLocaleString()} VND
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-center text-sm text-muted-foreground">
                                        No promotions available for this service
                                    </div>
                                );
                            })()}

                            {/* Final Total */}
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold">Final Total:</span>
                                    <span className="text-2xl font-bold text-primary">
                                        {calculateInvoiceTotals(selectedService).total.toLocaleString()} VND
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Loyalty Points: +{Math.floor(calculateInvoiceTotals(selectedService).total / 50000)}{" "}
                                    points
                                </p>
                            </div>

                            {/* Payment & Ratings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Payment Method *</Label>
                                    <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "Cash" | "Bank transfer")}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Cash">Cash</SelectItem>
                                            <SelectItem value="Bank transfer">Bank Transfer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Attitude Rating (0-5)</Label>
                                    <div className="flex items-center gap-2 mt-2">
                                        {[1, 2, 3, 4, 5].map((rating) => (
                                            <Button
                                                key={rating}
                                                type="button"
                                                variant={staffAttitudeRating >= rating ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setStaffAttitudeRating(rating)}
                                            >
                                                <Star className={`w-4 h-4 ${staffAttitudeRating >= rating ? "fill-current" : ""}`} />
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <Label>Satisfaction Rating (0-5)</Label>
                                    <div className="flex items-center gap-2 mt-2">
                                        {[1, 2, 3, 4, 5].map((rating) => (
                                            <Button
                                                key={rating}
                                                type="button"
                                                variant={overallSatisfaction >= rating ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setOverallSatisfaction(rating)}
                                            >
                                                <Star
                                                    className={`w-4 h-4 ${overallSatisfaction >= rating ? "fill-current" : ""}`}
                                                />
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <Label>Notes (Optional)</Label>
                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Additional notes..."
                                    rows={3}
                                />
                            </div>

                            {/* DEV-ONLY: Rating Quick-Fill Test Panel */}
                            {process.env.NODE_ENV === "development" && (
                                <Card className="border-2 border-dashed border-yellow-400 bg-yellow-50/50">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-yellow-700 flex items-center gap-2">
                                            ⚡ DEV MODE: Rating Quick-Fill
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Development-only panel for rapid rating testing
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="grid grid-cols-3 gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setStaffAttitudeRating(5);
                                                    setOverallSatisfaction(5);
                                                    setNotes("Excellent service! Very satisfied with the care provided. (Auto-filled)");
                                                }}
                                                className="border-green-300 hover:bg-green-50"
                                            >
                                                ⭐ Excellent (5,5)
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setStaffAttitudeRating(3);
                                                    setOverallSatisfaction(3);
                                                    setNotes("Average service. Met basic expectations. (Auto-filled)");
                                                }}
                                                className="border-yellow-300 hover:bg-yellow-50"
                                            >
                                                😐 Neutral (3,3)
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setStaffAttitudeRating(1);
                                                    setOverallSatisfaction(1);
                                                    setNotes("Poor service. Not satisfied with the experience. (Auto-filled)");
                                                }}
                                                className="border-red-300 hover:bg-red-50"
                                            >
                                                ❌ Poor (1,1)
                                            </Button>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">
                                            This panel only appears in development mode
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Action Button */}
                            <Button onClick={handleCompleteInvoice} className="w-full" size="lg">
                                <FileText className="w-4 h-4 mr-2" />
                                Complete Invoice
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Uninvoiced Services Table */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Pending Service Invoices</CardTitle>
                        <CardDescription>
                            Services completed by veterinarians awaiting invoice creation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Service ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Pet</TableHead>
                                    <TableHead>Service Type</TableHead>
                                    <TableHead>Veterinarian</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {serviceInstances.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No pending services to invoice
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    serviceInstances.map((service) => {
                                        const amount = service.basePrice + (service.vaccineCost || 0) + (service.packageCost || 0);
                                        return (
                                            <TableRow key={service.id}>
                                                <TableCell className="font-mono text-sm">{service.id}</TableCell>
                                                <TableCell>{service.customerName}</TableCell>
                                                <TableCell>{service.petName}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getServiceTypeIcon(service.serviceType)}
                                                        <span className="text-sm">
                                                            {getServiceTypeDisplay(service.serviceType)}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>Dr. {service.veterinarianName}</TableCell>
                                                <TableCell>
                                                    {new Date(service.datePerformed).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {amount.toLocaleString()} VND
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleCreateInvoiceClick(service)}
                                                    >
                                                        <Plus className="w-3 h-3 mr-1" />
                                                        Create Invoice
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Completed Invoices Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Completed Service Invoices</CardTitle>
                        <CardDescription>History of all service invoices</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead>Satisfaction</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No invoices created yet
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    invoices.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                                            <TableCell>{invoice.customerName}</TableCell>
                                            <TableCell className="font-medium">
                                                {invoice.total.toLocaleString()} VND
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">-{invoice.discount.toLocaleString()} VND</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={invoice.paymentMethod === "Cash" ? "default" : "outline"}>
                                                    {invoice.paymentMethod}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-sm">{invoice.overallSatisfaction}/5</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => navigate(`/sales/invoices/services/${invoice.id}`)}
                                                >
                                                    <Eye className="w-3 h-3 mr-1" />
                                                    View
                                                </Button>
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
