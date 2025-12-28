import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { ServiceInstance, ServiceInvoice } from "@shared/types";
import { Eye, Star, ClipboardList, MessageSquare, CheckCircle2, User, Building2 } from "lucide-react";

export default function CustomerServices() {
    const { user } = useAuth();
    const [services, setServices] = useState<ServiceInstance[]>([]);
    const [loading, setLoading] = useState(true);

    if (!user || user.role !== "customer") {
        return <Navigate to="/login" />;
    }

    useEffect(() => {
        loadServices();
    }, [user]);

    const loadServices = () => {
        try {
            const allServices = JSON.parse(localStorage.getItem("petcare_service_instances") || "[]");

            // Filter services for this customer that have been invoiced
            const customerServices = allServices.filter(
                (service: ServiceInstance) => service.customerId === user.id && service.invoiceId
            );

            // Sort by date (most recent first)
            customerServices.sort((a: ServiceInstance, b: ServiceInstance) =>
                new Date(b.datePerformed).getTime() - new Date(a.datePerformed).getTime()
            );

            setServices(customerServices);
        } catch (error) {
            console.error("Error loading services:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
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

    const getInvoiceTotal = (service: ServiceInstance) => {
        try {
            if (!service.invoiceId) {
                return service.basePrice + (service.vaccineCost || 0) + (service.packageCost || 0);
            }

            const allInvoices = JSON.parse(localStorage.getItem("petcare_service_invoices") || "[]");
            const invoice = allInvoices.find((inv: ServiceInvoice) =>
                inv.serviceInstanceIds.includes(service.id)
            );

            if (invoice) {
                return invoice.total;
            }

            return service.basePrice + (service.vaccineCost || 0) + (service.packageCost || 0);
        } catch {
            return service.basePrice + (service.vaccineCost || 0) + (service.packageCost || 0);
        }
    };

    const getVetName = (vetId: string) => {
        try {
            const users = JSON.parse(localStorage.getItem("petcare_users") || "[]");
            const vet = users.find((u: any) => u.id === vetId);
            return vet?.fullName || "Unknown Vet";
        } catch {
            return "Unknown Vet";
        }
    };

    const getRatingStatusBadge = (service: ServiceInstance) => {
        if (service.rated) {
            return (
                <Badge className="bg-green-100 text-green-800 border-green-300">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Rated
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                <Star className="h-3 w-3 mr-1" />
                Not Rated
            </Badge>
        );
    };

    const getRatingButton = (service: ServiceInstance) => {
        if (service.rated) {
            return (
                <Link to={`/customer/services/${service.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        View Rating
                    </Button>
                </Link>
            );
        }
        return (
            <Link to={`/customer/services/${service.id}`}>
                <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                    <Star className="h-4 w-4" />
                    Rate Service
                </Button>
            </Link>
        );
    };

    const getStatusBadge = (service: ServiceInstance) => {
        if (service.rated) {
            return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">Rated</Badge>;
        }
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">Completed</Badge>;
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg p-8 mb-8">
                    <h1 className="text-4xl font-bold mb-2">My Service History</h1>
                    <p className="text-blue-100 text-lg">View and rate all your completed pet care services</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                            <ClipboardList className="h-5 w-5 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{services.length}</div>
                            <p className="text-xs text-muted-foreground">Completed services</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rated Services</CardTitle>
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {services.filter(s => s.rated).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Reviews submitted</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                            <Star className="h-5 w-5 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {services.filter(s => !s.rated).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Awaiting feedback</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Your Feedback</CardTitle>
                            <MessageSquare className="h-5 w-5 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {services.filter(s => s.rated && s.comment).length}
                            </div>
                            <p className="text-xs text-muted-foreground">With comments</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Services Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Service History</CardTitle>
                        <CardDescription>
                            All your completed services with rating status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">Loading services...</p>
                            </div>
                        ) : services.length === 0 ? (
                            <div className="text-center py-12">
                                <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground mb-2">No service history yet</p>
                                <p className="text-sm text-muted-foreground">
                                    Your completed services will appear here
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Service Type</TableHead>
                                            <TableHead>Pet</TableHead>
                                            <TableHead>Veterinarian</TableHead>
                                            <TableHead>Branch</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead>Rating Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {services.map((service) => (
                                            <TableRow key={service.id}>
                                                <TableCell className="font-medium">
                                                    {formatDate(service.datePerformed)}
                                                </TableCell>
                                                <TableCell>
                                                    {getServiceTypeName(service.serviceType)}
                                                </TableCell>
                                                <TableCell>{service.petName}</TableCell>
                                                <TableCell>{getVetName(service.veterinarianId)}</TableCell>
                                                <TableCell>{getBranchName(service.branchId)}</TableCell>
                                                <TableCell className="font-semibold text-primary">
                                                    {formatPrice(getInvoiceTotal(service))}
                                                </TableCell>
                                                <TableCell>
                                                    {getRatingStatusBadge(service)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link to={`/customer/services/${service.id}`}>
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        {getRatingButton(service)}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Info Box */}
                {services.length > 0 && services.filter(s => !s.rated).length > 0 && (
                    <Card className="mt-6 border-blue-200 bg-blue-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <Star className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-blue-900 mb-1">
                                        Help us improve our service!
                                    </p>
                                    <p className="text-sm text-blue-700">
                                        You have {services.filter(s => !s.rated).length} service(s) pending review.
                                        Your feedback helps us provide better care for your pets.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
