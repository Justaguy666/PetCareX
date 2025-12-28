import { Navigate, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { ServiceInstance, ServiceInvoice, Pet, VaccinePackage } from "@shared/types";
import {
    ArrowLeft,
    Calendar,
    User,
    Building2,
    ClipboardList,
    DollarSign,
    Star,
    Heart,
    Syringe,
    Package,
    CreditCard,
    Award,
    CheckCircle,
    ThumbsUp,
    Smile,
    AlertCircle,
    Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CustomerServiceDetail() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [service, setService] = useState<ServiceInstance | null>(null);
    const [invoice, setInvoice] = useState<ServiceInvoice | null>(null);
    const [pet, setPet] = useState<Pet | null>(null);
    const [loading, setLoading] = useState(true);

    // Rating form state
    const [serviceQualityRating, setServiceQualityRating] = useState(0);
    const [staffAttitudeRating, setStaffAttitudeRating] = useState(0);
    const [overallSatisfaction, setOverallSatisfaction] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Development testing state
    const [testingMode, setTestingMode] = useState(false);
    const [testServices, setTestServices] = useState<ServiceInstance[]>([]);
    const [selectedTestService, setSelectedTestService] = useState<string>("");

    const isDevelopment = import.meta.env.DEV;

    if (!user || user.role !== "customer") {
        return <Navigate to="/login" />;
    }

    useEffect(() => {
        if (id) {
            loadServiceDetail(id);
        }

        // Load test services in development mode
        if (isDevelopment) {
            loadTestServices();
        }
    }, [id]);

    const loadServiceDetail = (serviceId: string) => {
        try {
            const allServices = JSON.parse(localStorage.getItem("petcare_service_instances") || "[]");
            const allInvoices = JSON.parse(localStorage.getItem("petcare_service_invoices") || "[]");
            const allPets = JSON.parse(localStorage.getItem("petcare_pets") || "[]");

            const foundService = allServices.find((s: ServiceInstance) => s.id === serviceId);

            if (!foundService || foundService.customerId !== user.id) {
                toast({
                    title: "Service not found",
                    description: "The requested service could not be found.",
                    variant: "destructive",
                });
                navigate("/customer/services");
                return;
            }

            setService(foundService);

            // Find invoice
            if (foundService.invoiceId) {
                const foundInvoice = allInvoices.find(
                    (inv: ServiceInvoice) => inv.serviceInstanceIds.includes(serviceId)
                );
                setInvoice(foundInvoice || null);
            }

            // Find pet
            const foundPet = allPets.find((p: Pet) => p.id === foundService.petId);
            setPet(foundPet || null);
        } catch (error) {
            console.error("Error loading service detail:", error);
            toast({
                title: "Error",
                description: "Failed to load service details.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const loadTestServices = () => {
        try {
            const allServices = JSON.parse(localStorage.getItem("petcare_service_instances") || "[]");
            // Get services for this customer with invoices (completed) that haven't been rated
            const completedServices = allServices.filter(
                (s: ServiceInstance) => s.customerId === user.id && s.invoiceId && !s.rated
            );
            setTestServices(completedServices);
        } catch (error) {
            console.error("Error loading test services:", error);
        }
    };

    const handleRatingSubmit = async () => {
        if (!service) return;

        // Validation
        if (serviceQualityRating === 0 || staffAttitudeRating === 0 || overallSatisfaction === 0) {
            toast({
                title: "Incomplete Rating",
                description: "Please provide all three ratings before submitting.",
                variant: "destructive",
            });
            return;
        }

        if (comment.trim().length === 0) {
            toast({
                title: "Comment Required",
                description: "Please provide a comment with your rating.",
                variant: "destructive",
            });
            return;
        }

        if (comment.length > 500) {
            toast({
                title: "Comment Too Long",
                description: "Comment must be 500 characters or less.",
                variant: "destructive",
            });
            return;
        }

        setSubmitting(true);

        try {
            // Update service instance
            const allServices = JSON.parse(localStorage.getItem("petcare_service_instances") || "[]");
            const updatedServices = allServices.map((s: ServiceInstance) => {
                if (s.id === service.id) {
                    return {
                        ...s,
                        serviceQualityRating,
                        staffAttitudeRating,
                        overallSatisfaction,
                        comment: comment.trim(),
                        rated: true,
                    };
                }
                return s;
            });
            localStorage.setItem("petcare_service_instances", JSON.stringify(updatedServices));

            // Update invoice ratings (average of all services in invoice)
            if (invoice) {
                const allInvoices = JSON.parse(localStorage.getItem("petcare_service_invoices") || "[]");
                const updatedInvoices = allInvoices.map((inv: ServiceInvoice) => {
                    if (inv.id === invoice.id) {
                        // Get all services in this invoice
                        const invoiceServices = updatedServices.filter((s: ServiceInstance) =>
                            inv.serviceInstanceIds.includes(s.id)
                        );

                        // Calculate average ratings for invoice (only staffAttitudeRating and overallSatisfaction)
                        const ratedServices = invoiceServices.filter((s: ServiceInstance) => s.rated);
                        const avgStaffAttitude = ratedServices.length > 0
                            ? Math.round(ratedServices.reduce((sum: number, s: ServiceInstance) => sum + (s.staffAttitudeRating || 0), 0) / ratedServices.length)
                            : undefined;
                        const avgSatisfaction = ratedServices.length > 0
                            ? Math.round(ratedServices.reduce((sum: number, s: ServiceInstance) => sum + (s.overallSatisfaction || 0), 0) / ratedServices.length)
                            : undefined;

                        return {
                            ...inv,
                            staffAttitudeRating: avgStaffAttitude,
                            overallSatisfaction: avgSatisfaction,
                        };
                    }
                    return inv;
                });
                localStorage.setItem("petcare_service_invoices", JSON.stringify(updatedInvoices));
            }

            toast({
                title: "Thank you for your feedback!",
                description: "Your rating has been submitted successfully.",
            });

            // Reload service and test services
            loadServiceDetail(service.id);
            if (isDevelopment) {
                loadTestServices();
            }
        } catch (error) {
            console.error("Error submitting rating:", error);
            toast({
                title: "Error",
                description: "Failed to submit rating. Please try again.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const applyTestTemplate = (template: "good" | "neutral" | "bad") => {
        switch (template) {
            case "good":
                setServiceQualityRating(5);
                setStaffAttitudeRating(5);
                setOverallSatisfaction(5);
                setComment("Excellent service! The staff was professional and caring. My pet received great care and I'm very satisfied with the overall experience.");
                break;
            case "neutral":
                setServiceQualityRating(3);
                setStaffAttitudeRating(3);
                setOverallSatisfaction(3);
                setComment("The service was okay. Nothing particularly stood out, but there were no major issues either. Average experience overall.");
                break;
            case "bad":
                setServiceQualityRating(2);
                setStaffAttitudeRating(2);
                setOverallSatisfaction(2);
                setComment("Service could be improved. There were some delays and communication issues. Expected better care for the price paid.");
                break;
        }
    };

    const switchToTestService = (serviceId: string) => {
        if (serviceId) {
            navigate(`/customer/services/${serviceId}`);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getServiceTypeName = (type: string) => {
        switch (type) {
            case "medical-exam":
                return "Medical Exam";
            case "single-vaccine":
                return "Single-Dose Injection";
            case "vaccine-package":
                return "Package Injection";
            case "purchase":
                return "Purchase";
            default:
                return type;
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

    const getPackageDetails = (packageId: string) => {
        try {
            const packages = JSON.parse(localStorage.getItem("petcare_vaccine_packages") || "[]");
            return packages.find((p: VaccinePackage) => p.id === packageId) || null;
        } catch {
            return null;
        }
    };

    const StarRating = ({
        rating,
        onRatingChange,
        readonly = false,
        showSlider = false
    }: {
        rating: number;
        onRatingChange?: (rating: number) => void;
        readonly?: boolean;
        showSlider?: boolean;
    }) => {
        return (
            <div className="space-y-2">
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => !readonly && onRatingChange && onRatingChange(star)}
                            disabled={readonly}
                            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
                        >
                            <Star
                                className={`h-6 w-6 ${star <= rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-200 text-gray-300"
                                    }`}
                            />
                        </button>
                    ))}
                    <span className="ml-2 text-sm font-medium text-muted-foreground">
                        {rating > 0 ? `${rating}/5` : "Not rated"}
                    </span>
                </div>
                {showSlider && !readonly && onRatingChange && (
                    <Slider
                        value={[rating]}
                        onValueChange={(values) => onRatingChange(values[0])}
                        max={5}
                        min={0}
                        step={1}
                        className="w-full"
                    />
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Loading service details...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Service not found</p>
                        <Button onClick={() => navigate("/customer/services")} className="mt-4">
                            Back to Services
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    const subtotal = service.basePrice + (service.vaccineCost || 0) + (service.packageCost || 0);
    const finalTotal = invoice?.total || subtotal;
    const discount = subtotal - finalTotal;

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Back Button */}
                <Button
                    variant="outline"
                    onClick={() => navigate("/customer/services")}
                    className="mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Services
                </Button>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Service Details</h1>
                    <p className="text-muted-foreground">
                        View complete information about this service
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Service Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ClipboardList className="h-5 w-5" />
                                    Service Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-muted-foreground">Service Type</Label>
                                    <p className="font-medium text-lg">{getServiceTypeName(service.serviceType)}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <Label className="text-muted-foreground">Date Performed</Label>
                                        <p className="font-medium">{formatDate(service.datePerformed)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <Label className="text-muted-foreground">Veterinarian</Label>
                                        <p className="font-medium">{service.veterinarianName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <Label className="text-muted-foreground">Branch</Label>
                                        <p className="font-medium">{getBranchName(service.branchId)}</p>
                                    </div>
                                </div>
                                {service.notes && (
                                    <div>
                                        <Label className="text-muted-foreground">Notes</Label>
                                        <p className="text-sm mt-1 p-3 bg-muted rounded-md">{service.notes}</p>
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
                                        <p className="font-medium">{pet.name}</p>
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
                                </CardContent>
                            </Card>
                        )}

                        {/* Cost Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Cost Breakdown
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Base Service Price</span>
                                    <span className="font-medium">{formatPrice(service.basePrice)}</span>
                                </div>
                                {service.vaccineCost && service.vaccineCost > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Vaccine Cost</span>
                                        <span className="font-medium">{formatPrice(service.vaccineCost)}</span>
                                    </div>
                                )}
                                {service.packageCost && service.packageCost > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Package Cost</span>
                                        <span className="font-medium">{formatPrice(service.packageCost)}</span>
                                    </div>
                                )}
                                <div className="border-t pt-3 flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">{formatPrice(subtotal)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount Applied</span>
                                        <span className="font-medium">-{formatPrice(discount)}</span>
                                    </div>
                                )}
                                <div className="border-t pt-3 flex justify-between text-lg">
                                    <span className="font-semibold">Final Total</span>
                                    <span className="font-bold text-primary">{formatPrice(finalTotal)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Injection Details */}
                        {(service.serviceType === "single-vaccine" || service.serviceType === "vaccine-package") && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Syringe className="h-5 w-5" />
                                        Injection Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {service.serviceType === "single-vaccine" && (
                                        <div>
                                            <Label className="text-muted-foreground mb-2 block">Vaccine Administered</Label>
                                            {service.vaccinesUsed.map((vaccine, index) => (
                                                <div key={index} className="p-3 bg-muted rounded-md">
                                                    <p className="font-medium">{vaccine.vaccineName}</p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Dosage: {vaccine.dosage} ml
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {service.serviceType === "vaccine-package" && service.packageId && (
                                        <div>
                                            <Label className="text-muted-foreground mb-2 block">Package Information</Label>
                                            {(() => {
                                                const packageDetails = getPackageDetails(service.packageId!);
                                                return (
                                                    <div className="space-y-3">
                                                        {packageDetails && (
                                                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <Package className="h-4 w-4 text-blue-600" />
                                                                    <p className="font-medium text-blue-900">{packageDetails.name}</p>
                                                                </div>
                                                                <p className="text-sm text-blue-700">
                                                                    Month Mark: {packageDetails.monthMark} months
                                                                </p>
                                                            </div>
                                                        )}
                                                        <Label className="text-muted-foreground block">Vaccines in Package</Label>
                                                        <div className="space-y-2">
                                                            {service.vaccinesUsed.map((vaccine, index) => (
                                                                <div
                                                                    key={index}
                                                                    className={`p-3 rounded-md ${vaccine.administered
                                                                        ? 'bg-green-50 border border-green-200'
                                                                        : 'bg-gray-50 border border-gray-200'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <div>
                                                                            <p className="font-medium">{vaccine.vaccineName}</p>
                                                                            <p className="text-sm text-muted-foreground">
                                                                                Dosage: {vaccine.dosage} ml
                                                                            </p>
                                                                        </div>
                                                                        {vaccine.administered && (
                                                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Invoice Summary */}
                        {invoice && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Invoice Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <Label className="text-muted-foreground">Invoice ID</Label>
                                        <p className="font-medium">{invoice.id}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Payment Method</Label>
                                        <Badge variant="outline" className="mt-1">
                                            {invoice.paymentMethod}
                                        </Badge>
                                    </div>
                                    {invoice.loyaltyPointsEarned > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Award className="h-4 w-4 text-purple-600" />
                                            <div>
                                                <Label className="text-muted-foreground">Loyalty Points Earned</Label>
                                                <p className="font-medium text-purple-600">
                                                    +{invoice.loyaltyPointsEarned} points
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {invoice.appliedPromotions.length > 0 && (
                                        <div>
                                            <Label className="text-muted-foreground">Promotions Applied</Label>
                                            <div className="mt-1 space-y-1">
                                                {invoice.appliedPromotions.map((promoId, index) => (
                                                    <Badge key={index} variant="secondary" className="mr-1">
                                                        {promoId}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Rating Section */}
                        <Card className={service.rated ? "border-green-200" : "border-blue-200"}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className={service.rated ? "h-5 w-5 text-green-600" : "h-5 w-5 text-blue-600"} />
                                    {service.rated ? "Your Rating" : "Rate This Service"}
                                </CardTitle>
                                <CardDescription>
                                    {service.rated
                                        ? "Thank you for your feedback!"
                                        : "Share your experience to help us improve"
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {service.rated ? (
                                    // Read-only rating display with summary
                                    <div className="space-y-4">
                                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                <p className="font-semibold text-green-900">Rating Submitted</p>
                                            </div>
                                            <p className="text-sm text-green-700">
                                                Thank you for taking the time to share your feedback!
                                            </p>
                                        </div>

                                        <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <ThumbsUp className="h-4 w-4 text-blue-600" />
                                                    <Label className="font-medium">Service Quality</Label>
                                                </div>
                                                <StarRating rating={service.serviceQualityRating || 0} readonly />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Smile className="h-4 w-4 text-purple-600" />
                                                    <Label className="font-medium">Staff Attitude</Label>
                                                </div>
                                                <StarRating rating={service.staffAttitudeRating || 0} readonly />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Sparkles className="h-4 w-4 text-amber-600" />
                                                    <Label className="font-medium">Overall Satisfaction</Label>
                                                </div>
                                                <StarRating rating={service.overallSatisfaction || 0} readonly />
                                            </div>
                                        </div>

                                        {service.comment && (
                                            <div>
                                                <Label className="mb-2 block font-medium">Your Comment</Label>
                                                <div className="p-3 bg-background border rounded-md">
                                                    <p className="text-sm leading-relaxed">{service.comment}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    // Rating form with sliders
                                    <div className="space-y-5">
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <ThumbsUp className="h-4 w-4 text-blue-600" />
                                                <Label className="font-medium">
                                                    Service Quality <span className="text-red-500">*</span>
                                                </Label>
                                            </div>
                                            <StarRating
                                                rating={serviceQualityRating}
                                                onRatingChange={setServiceQualityRating}
                                                showSlider
                                            />
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Smile className="h-4 w-4 text-purple-600" />
                                                <Label className="font-medium">
                                                    Staff Attitude <span className="text-red-500">*</span>
                                                </Label>
                                            </div>
                                            <StarRating
                                                rating={staffAttitudeRating}
                                                onRatingChange={setStaffAttitudeRating}
                                                showSlider
                                            />
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Sparkles className="h-4 w-4 text-amber-600" />
                                                <Label className="font-medium">
                                                    Overall Satisfaction <span className="text-red-500">*</span>
                                                </Label>
                                            </div>
                                            <StarRating
                                                rating={overallSatisfaction}
                                                onRatingChange={setOverallSatisfaction}
                                                showSlider
                                            />
                                        </div>

                                        <div>
                                            <Label className="mb-2 block font-medium">
                                                Comment <span className="text-red-500">*</span>
                                                <span className="text-xs text-muted-foreground ml-2 font-normal">
                                                    (Max 500 characters)
                                                </span>
                                            </Label>
                                            <Textarea
                                                placeholder="Share your experience with this service..."
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                maxLength={500}
                                                rows={4}
                                                className="resize-none"
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {comment.length}/500 characters
                                            </p>
                                        </div>

                                        <Button
                                            onClick={handleRatingSubmit}
                                            disabled={submitting}
                                            className="w-full"
                                            size="lg"
                                        >
                                            {submitting ? "Submitting..." : "Submit Rating"}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Development Testing Panel */}
                        {isDevelopment && !service.rated && (
                            <Card className="border-orange-200 bg-orange-50/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-orange-900">
                                        <AlertCircle className="h-5 w-5" />
                                        Development Testing Panel
                                    </CardTitle>
                                    <CardDescription className="text-orange-700">
                                        Quick tools for testing the rating system
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Service Switcher */}
                                    {testServices.length > 0 && (
                                        <div>
                                            <Label className="mb-2 block font-medium">Switch to Service</Label>
                                            <Select value={selectedTestService} onValueChange={switchToTestService}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a service to rate" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {testServices.map((s) => (
                                                        <SelectItem key={s.id} value={s.id}>
                                                            {s.serviceType} - {new Date(s.datePerformed).toLocaleDateString("en-US")}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {testServices.length} unrated service(s) available
                                            </p>
                                        </div>
                                    )}

                                    {/* Template Buttons */}
                                    <div>
                                        <Label className="mb-2 block font-medium">Quick Fill Templates</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Button
                                                onClick={() => applyTestTemplate("good")}
                                                variant="outline"
                                                className="border-green-300 hover:bg-green-50"
                                                size="sm"
                                            >
                                                <ThumbsUp className="h-3 w-3 mr-1" />
                                                Good
                                            </Button>
                                            <Button
                                                onClick={() => applyTestTemplate("neutral")}
                                                variant="outline"
                                                className="border-gray-300 hover:bg-gray-50"
                                                size="sm"
                                            >
                                                <Star className="h-3 w-3 mr-1" />
                                                Neutral
                                            </Button>
                                            <Button
                                                onClick={() => applyTestTemplate("bad")}
                                                variant="outline"
                                                className="border-red-300 hover:bg-red-50"
                                                size="sm"
                                            >
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                Bad
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Testing Info */}
                                    <div className="p-3 bg-orange-100 border border-orange-300 rounded-md">
                                        <p className="text-xs text-orange-900">
                                            <strong>Tip:</strong> Use the template buttons to quickly fill the form with test data,
                                            then adjust ratings with stars or sliders before submitting.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
