import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminHeader from "@/components/AdminHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect, useMemo } from "react";
import { ServiceInstance, ServiceInvoice, Branch, User, Pet } from "@shared/types";
import { Star, Eye, Filter, Download } from "lucide-react";

interface RatedService extends ServiceInstance {
    customerName: string;
    branchName: string;
    invoiceTotal?: number;
}

interface FeedbackModalData {
    service: RatedService;
    pet: Pet | null;
    invoice: ServiceInvoice | null;
}

export default function RatingAnalytics() {
    const { user } = useAuth();
    const [services, setServices] = useState<RatedService[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [vets, setVets] = useState<User[]>([]);
    const [invoices, setInvoices] = useState<ServiceInvoice[]>([]);

    // Filters
    const [selectedBranch, setSelectedBranch] = useState<string>("all");
    const [selectedServiceType, setSelectedServiceType] = useState<string>("all");
    const [selectedVet, setSelectedVet] = useState<string>("all");

    // Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState<FeedbackModalData | null>(null);

    if (!user || user.role !== "admin") {
        return <Navigate to="/login" />;
    }

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        try {
            const allServices = JSON.parse(localStorage.getItem("petcare_service_instances") || "[]");
            const allInvoices = JSON.parse(localStorage.getItem("petcare_service_invoices") || "[]");
            const allBranches = JSON.parse(localStorage.getItem("petcare_branches") || "[]");
            const allUsers = JSON.parse(localStorage.getItem("petcare_users") || "[]");

            console.log("📊 Rating Analytics - Loading data...");
            console.log("Total services:", allServices.length);

            // Filter rated services only
            const ratedServices = allServices.filter((s: ServiceInstance) => s.rated === true);
            console.log("Rated services:", ratedServices.length);

            // Enrich with customer and branch names
            const enrichedServices: RatedService[] = ratedServices.map((service: ServiceInstance) => {
                const branch = allBranches.find((b: Branch) => b.id === service.branchId);
                const customer = allUsers.find((u: User) => u.id === service.customerId);
                const invoice = allInvoices.find((inv: ServiceInvoice) => inv.serviceInstanceIds.includes(service.id));

                return {
                    ...service,
                    customerName: customer?.fullName || "Unknown",
                    branchName: branch?.name || "Unknown",
                    invoiceTotal: invoice?.total
                };
            });

            setServices(enrichedServices);
            setBranches(allBranches);
            setVets(allUsers.filter((u: User) => u.role === "veterinarian"));
            setInvoices(allInvoices);

            console.log("✅ Data loaded successfully!");
        } catch (error) {
            console.error("❌ Error loading data:", error);
        }
    };

    // Dynamic filtering
    const filteredServices = useMemo(() => {
        return services.filter(service => {
            if (selectedBranch !== "all" && service.branchId !== selectedBranch) return false;
            if (selectedServiceType !== "all" && service.serviceType !== selectedServiceType) return false;
            if (selectedVet !== "all" && service.veterinarianId !== selectedVet) return false;
            return true;
        });
    }, [services, selectedBranch, selectedServiceType, selectedVet]);

    // Calculate summary metrics
    const summaryMetrics = useMemo(() => {
        if (filteredServices.length === 0) {
            return {
                avgQuality: 0,
                avgAttitude: 0,
                avgSatisfaction: 0,
                totalRated: 0
            };
        }

        const totalQuality = filteredServices.reduce((sum, s) => sum + (s.serviceQualityRating || 0), 0);
        const totalAttitude = filteredServices.reduce((sum, s) => sum + (s.staffAttitudeRating || 0), 0);
        const totalSatisfaction = filteredServices.reduce((sum, s) => sum + (s.overallSatisfaction || 0), 0);

        return {
            avgQuality: totalQuality / filteredServices.length,
            avgAttitude: totalAttitude / filteredServices.length,
            avgSatisfaction: totalSatisfaction / filteredServices.length,
            totalRated: filteredServices.length
        };
    }, [filteredServices]);

    const handleViewFeedback = (service: RatedService) => {
        const allPets = JSON.parse(localStorage.getItem("petcare_pets") || "[]");
        const pet = allPets.find((p: Pet) => p.id === service.petId);
        const invoice = invoices.find(inv => inv.serviceInstanceIds.includes(service.id));

        setModalData({ service, pet, invoice });
        setModalOpen(true);
    };

    const handleExportCSV = () => {
        const headers = [
            "Date",
            "Customer",
            "Pet Name",
            "Service Type",
            "Branch",
            "Veterinarian",
            "Service Quality",
            "Staff Attitude",
            "Overall Satisfaction",
            "Comment",
            "Invoice Total"
        ];

        const rows = filteredServices.map(service => {
            const vet = vets.find(v => v.id === service.veterinarianId);
            return [
                new Date(service.datePerformed).toLocaleDateString(),
                service.customerName,
                service.petName || "N/A",
                service.serviceType,
                service.branchName,
                vet?.fullName || "N/A",
                service.serviceQualityRating || 0,
                service.staffAttitudeRating || 0,
                service.overallSatisfaction || 0,
                `"${(service.comment || "").replace(/"/g, '""')}"`,
                service.invoiceTotal?.toLocaleString() || "N/A"
            ];
        });

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `rating-analytics-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                ))}
            </div>
        );
    };

    const getServiceTypeBadge = (type: string) => {
        const badges = {
            "medical-exam": <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Medical Exam</Badge>,
            "single-vaccine": <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Single Vaccine</Badge>,
            "vaccine-package": <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Vaccine Package</Badge>,
            "purchase": <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Purchase</Badge>
        };
        return badges[type as keyof typeof badges] || <Badge variant="outline">{type}</Badge>;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminHeader />

            {/* Main Content - with margin for desktop sidebar */}
            <div className="lg:ml-64">
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Rating Analytics</h1>
                        <p className="text-gray-600 mt-1">Customer feedback and service ratings</p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Avg Service Quality</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">
                                    {summaryMetrics.avgQuality.toFixed(1)}
                                </div>
                                {renderStars(Math.round(summaryMetrics.avgQuality))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Avg Staff Attitude</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-600">
                                    {summaryMetrics.avgAttitude.toFixed(1)}
                                </div>
                                {renderStars(Math.round(summaryMetrics.avgAttitude))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Avg Overall Satisfaction</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-pink-600">
                                    {summaryMetrics.avgSatisfaction.toFixed(1)}
                                </div>
                                {renderStars(Math.round(summaryMetrics.avgSatisfaction))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Rated Services</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {summaryMetrics.totalRated}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Services</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filter Panel */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Branch</label>
                                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Branches" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Branches</SelectItem>
                                            {branches.map(branch => (
                                                <SelectItem key={branch.id} value={branch.id}>
                                                    {branch.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Service Type</label>
                                    <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="medical-exam">Medical Exam</SelectItem>
                                            <SelectItem value="single-vaccine">Single Vaccine</SelectItem>
                                            <SelectItem value="vaccine-package">Vaccine Package</SelectItem>
                                            <SelectItem value="purchase">Purchase</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Veterinarian</label>
                                    <Select value={selectedVet} onValueChange={setSelectedVet}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Vets" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Veterinarians</SelectItem>
                                            {vets.map(vet => (
                                                <SelectItem key={vet.id} value={vet.id}>
                                                    {vet.fullName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedBranch("all");
                                            setSelectedServiceType("all");
                                            setSelectedVet("all");
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                    <Button onClick={handleExportCSV}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Export CSV
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ratings Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Feedback ({filteredServices.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {filteredServices.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg">No rated services found</p>
                                    <p className="text-gray-400 text-sm mt-2">
                                        Customers need to rate completed services from "My Services" page
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Customer</TableHead>
                                                <TableHead>Service</TableHead>
                                                <TableHead>Branch</TableHead>
                                                <TableHead>Veterinarian</TableHead>
                                                <TableHead>Quality</TableHead>
                                                <TableHead>Attitude</TableHead>
                                                <TableHead>Satisfaction</TableHead>
                                                <TableHead>Comment</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredServices.map(service => {
                                                const vet = vets.find(v => v.id === service.veterinarianId);
                                                return (
                                                    <TableRow key={service.id}>
                                                        <TableCell className="whitespace-nowrap">
                                                            {new Date(service.datePerformed).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {service.customerName}
                                                        </TableCell>
                                                        <TableCell>
                                                            {getServiceTypeBadge(service.serviceType)}
                                                        </TableCell>
                                                        <TableCell>{service.branchName}</TableCell>
                                                        <TableCell>
                                                            {vet?.fullName || "N/A"}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                                <span className="font-semibold">{service.serviceQualityRating || 0}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                                <span className="font-semibold">{service.staffAttitudeRating || 0}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                                <span className="font-semibold">{service.overallSatisfaction || 0}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="max-w-xs">
                                                            <p className="truncate text-sm text-gray-600">
                                                                {service.comment || "No comment"}
                                                            </p>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleViewFeedback(service)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Feedback Detail Modal */}
                    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Rating Details</DialogTitle>
                            </DialogHeader>
                            {modalData && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Customer</p>
                                            <p className="font-medium">{modalData.service.customerName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Service Date</p>
                                            <p className="font-medium">
                                                {new Date(modalData.service.datePerformed).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Service Type</p>
                                            <div className="mt-1">{getServiceTypeBadge(modalData.service.serviceType)}</div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Branch</p>
                                            <p className="font-medium">{modalData.service.branchName}</p>
                                        </div>
                                        {modalData.pet && (
                                            <div>
                                                <p className="text-sm text-gray-500">Pet</p>
                                                <p className="font-medium">{modalData.pet.name} ({modalData.pet.type})</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm text-gray-500">Veterinarian</p>
                                            <p className="font-medium">
                                                {vets.find(v => v.id === modalData.service.veterinarianId)?.fullName || "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h3 className="font-semibold mb-3">Ratings</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Service Quality</span>
                                                <div className="flex items-center gap-2">
                                                    {renderStars(modalData.service.serviceQualityRating || 0)}
                                                    <span className="font-semibold text-lg">
                                                        {modalData.service.serviceQualityRating || 0}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Staff Attitude</span>
                                                <div className="flex items-center gap-2">
                                                    {renderStars(modalData.service.staffAttitudeRating || 0)}
                                                    <span className="font-semibold text-lg">
                                                        {modalData.service.staffAttitudeRating || 0}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Overall Satisfaction</span>
                                                <div className="flex items-center gap-2">
                                                    {renderStars(modalData.service.overallSatisfaction || 0)}
                                                    <span className="font-semibold text-lg">
                                                        {modalData.service.overallSatisfaction || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {modalData.service.comment && (
                                        <div className="border-t pt-4">
                                            <h3 className="font-semibold mb-2">Customer Comment</h3>
                                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                                {modalData.service.comment}
                                            </p>
                                        </div>
                                    )}

                                    {modalData.service.notes && (
                                        <div className="border-t pt-4">
                                            <h3 className="font-semibold mb-2">Service Notes</h3>
                                            <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded">
                                                {modalData.service.notes}
                                            </p>
                                        </div>
                                    )}

                                    {modalData.invoice && (
                                        <div className="border-t pt-4">
                                            <h3 className="font-semibold mb-2">Invoice Information</h3>
                                            <div className="bg-gray-50 p-3 rounded">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm">Total Amount</span>
                                                    <span className="font-bold text-lg text-green-600">
                                                        ${modalData.invoice.total.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
