import SalesHeader from "@/components/SalesHeader";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { ArrowLeft, FileText, User, PawPrint, Star, DollarSign, Calendar, CreditCard, Syringe, Package as PackageIcon } from "lucide-react";
import type { ServiceInvoice, ServiceInstance, User as UserType, Pet, GlobalPromotion, BranchPromotion } from "@shared/types";

export default function ServiceInvoiceDetail() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [invoice, setInvoice] = useState<ServiceInvoice | null>(null);
    const [serviceInstances, setServiceInstances] = useState<ServiceInstance[]>([]);
    const [customer, setCustomer] = useState<UserType | null>(null);
    const [pets, setPets] = useState<Pet[]>([]);
    const [promotions, setPromotions] = useState<(GlobalPromotion | BranchPromotion)[]>([]);

    if (!user || user.role !== "sales") return <Navigate to="/login" />;

    useEffect(() => {
        const loadedInvoices = JSON.parse(localStorage.getItem("petcare_service_invoices") || "[]");
        const loadedServices = JSON.parse(localStorage.getItem("petcare_service_instances") || "[]");
        const loadedUsers = JSON.parse(localStorage.getItem("petcare_users") || "[]");
        const loadedPets = JSON.parse(localStorage.getItem("petcare_pets") || "[]");
        const loadedGlobalPromotions = JSON.parse(localStorage.getItem("petcare_global_promotions") || "[]");
        const loadedBranchPromotions = JSON.parse(localStorage.getItem("petcare_branch_promotions") || "[]");

        const foundInvoice = loadedInvoices.find((inv: ServiceInvoice) => inv.id === id);
        if (foundInvoice) {
            setInvoice(foundInvoice);

            // Load related service instances
            const relatedServices = loadedServices.filter((s: ServiceInstance) =>
                foundInvoice.serviceInstanceIds.includes(s.id)
            );
            setServiceInstances(relatedServices);

            // Load customer
            const foundCustomer = loadedUsers.find((u: UserType) => u.id === foundInvoice.customerId);
            setCustomer(foundCustomer || null);

            // Load pets
            setPets(loadedPets);

            // Load applied promotions
            const allPromotions = [...loadedGlobalPromotions, ...loadedBranchPromotions];
            const appliedPromotions = allPromotions.filter((p: GlobalPromotion | BranchPromotion) =>
                foundInvoice.appliedPromotions.includes(p.id)
            );
            setPromotions(appliedPromotions);
        }
    }, [id]);

    if (!invoice) {
        return (
            <div className="min-h-screen bg-background">
                <SalesHeader />
                <main className="container mx-auto px-4 py-8">
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            Invoice not found
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    const getPet = (petId: string) => pets.find((p) => p.id === petId);

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
                <div className="mb-6 flex items-center gap-4">
                    <Button variant="outline" onClick={() => navigate("/sales/invoices/services")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Invoice Details</h1>
                        <p className="text-muted-foreground">Invoice ID: {invoice.id}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Customer Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="font-medium">{invoice.customerName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Phone</p>
                                        <p className="font-medium">{customer?.phone || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{customer?.email || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Membership</p>
                                        <Badge>{customer?.membershipLevel || "Cơ bản"}</Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Loyalty Points</p>
                                        <p className="font-medium">{customer?.loyaltyPoints || 0} points</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Service Details */}
                        {serviceInstances.map((service) => {
                            const pet = getPet(service.petId);
                            return (
                                <Card key={service.id}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <PawPrint className="w-5 h-5" />
                                            Service Details
                                        </CardTitle>
                                        <CardDescription>Service ID: {service.id}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Pet Information */}
                                        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                            <h4 className="font-medium mb-2">Pet Information</h4>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Name:</span>{" "}
                                                    <span className="font-medium">{service.petName}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Type:</span> {pet?.type || "N/A"}
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Breed:</span> {pet?.breed || "N/A"}
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Age:</span> {pet?.age || "N/A"} years
                                                </div>
                                            </div>
                                        </div>

                                        {/* Service Information */}
                                        <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                                            <h4 className="font-medium mb-2">Service Information</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-muted-foreground">Type:</span>
                                                    <div className="flex items-center gap-2">
                                                        {getServiceTypeIcon(service.serviceType)}
                                                        <Badge>{getServiceTypeDisplay(service.serviceType)}</Badge>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Veterinarian:</span>{" "}
                                                    <span className="font-medium">Dr. {service.veterinarianName}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Date Performed:</span>{" "}
                                                    {new Date(service.datePerformed).toLocaleString()}
                                                </div>
                                                {service.notes && (
                                                    <div>
                                                        <span className="text-muted-foreground">Notes:</span>
                                                        <p className="mt-1 text-sm">{service.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Vaccines Used */}
                                        {service.vaccinesUsed.length > 0 && (
                                            <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                                                <h4 className="font-medium mb-2">Vaccines Administered</h4>
                                                <div className="space-y-2">
                                                    {service.vaccinesUsed.map((vaccine, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border"
                                                        >
                                                            <span className="text-sm font-medium">{vaccine.vaccineName}</span>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline">{vaccine.dosage} dose(s)</Badge>
                                                                {vaccine.administered && (
                                                                    <Badge variant="secondary">✓ Administered</Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Cost Breakdown for this service */}
                                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                            <h4 className="font-medium mb-2">Service Cost</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Base Price:</span>
                                                    <span className="font-medium">{service.basePrice.toLocaleString()} VND</span>
                                                </div>
                                                {service.vaccineCost && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Vaccine Cost:</span>
                                                        <span className="font-medium">
                                                            {service.vaccineCost.toLocaleString()} VND
                                                        </span>
                                                    </div>
                                                )}
                                                {service.packageCost && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Package Cost:</span>
                                                        <span className="font-medium">
                                                            {service.packageCost.toLocaleString()} VND
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {/* Applied Promotions */}
                        {promotions.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Badge className="w-5 h-5" />
                                        Applied Promotions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {promotions.map((promo) => (
                                            <div
                                                key={promo.id}
                                                className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg flex items-center justify-between"
                                            >
                                                <div>
                                                    <p className="font-medium">{promo.description}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Target: {promo.targetAudience}
                                                    </p>
                                                </div>
                                                <Badge variant="secondary">{promo.discountRate}% OFF</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar - Payment Summary */}
                    <div className="space-y-6">
                        {/* Financial Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5" />
                                    Payment Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal:</span>
                                        <span className="font-medium">{invoice.subtotal.toLocaleString()} VND</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Discount ({invoice.discountRate}%):
                                        </span>
                                        <span className="font-medium text-red-600">
                                            -{invoice.discount.toLocaleString()} VND
                                        </span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between">
                                        <span className="font-bold">Total:</span>
                                        <span className="text-xl font-bold text-primary">
                                            {invoice.total.toLocaleString()} VND
                                        </span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                                            <CreditCard className="w-4 h-4" />
                                            Payment Method:
                                        </span>
                                        <Badge variant={invoice.paymentMethod === "Cash" ? "default" : "outline"}>
                                            {invoice.paymentMethod}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Star className="w-4 h-4" />
                                            Loyalty Points:
                                        </span>
                                        <Badge variant="secondary">+{invoice.loyaltyPointsEarned} points</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Ratings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="w-5 h-5" />
                                    Ratings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Attitude Rating</p>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-5 h-5 ${(invoice.staffAttitudeRating || 0) >= star
                                                    ? "fill-yellow-500 text-yellow-500"
                                                    : "text-gray-300"
                                                    }`}
                                            />
                                        ))}
                                        <span className="ml-2 font-medium">{invoice.staffAttitudeRating}/5</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Satisfaction Rating</p>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-5 h-5 ${(invoice.overallSatisfaction || 0) >= star
                                                    ? "fill-yellow-500 text-yellow-500"
                                                    : "text-gray-300"
                                                    }`}
                                            />
                                        ))}
                                        <span className="ml-2 font-medium">{invoice.overallSatisfaction}/5</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Invoice Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Invoice Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Created By:</p>
                                    <p className="font-medium">{invoice.salesStaffName}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Created Date:</p>
                                    <p className="font-medium">
                                        {new Date(invoice.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Branch ID:</p>
                                    <p className="font-mono text-xs">{invoice.branchId}</p>
                                </div>
                                {invoice.notes && (
                                    <div>
                                        <p className="text-muted-foreground">Notes:</p>
                                        <p className="text-sm mt-1">{invoice.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
