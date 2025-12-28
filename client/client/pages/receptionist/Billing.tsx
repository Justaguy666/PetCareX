import ReceptionHeader from "@/components/ReceptionHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FileText, Eye, DollarSign, TrendingUp, CheckCircle, Clock } from "lucide-react";
import type { ServiceInvoice, Appointment } from "@shared/types";

export default function Billing() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [serviceInvoices, setServiceInvoices] = useState<ServiceInvoice[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [stats, setStats] = useState({
        totalInvoices: 0,
        totalRevenue: 0,
        pendingServices: 0,
        completedToday: 0,
    });

    if (!user || user.role !== "receptionist") return <Navigate to="/login" />;

    // Load data
    useEffect(() => {
        try {
            const loadedInvoices = JSON.parse(localStorage.getItem("petcare_service_invoices") || "[]");
            const loadedAppointments = JSON.parse(localStorage.getItem("petcare_appointments") || "[]");
            const loadedServiceInstances = JSON.parse(localStorage.getItem("petcare_service_instances") || "[]");

            // Filter by branch
            const branchInvoices = loadedInvoices.filter(
                (inv: ServiceInvoice) => inv.branchId === user.branchId
            );
            const branchAppointments = loadedAppointments.filter(
                (apt: Appointment) => apt.branchId === user.branchId
            );

            setServiceInvoices(branchInvoices);
            setAppointments(branchAppointments);

            // Calculate stats
            const today = new Date().toISOString().split("T")[0];
            const todayInvoices = branchInvoices.filter(
                (inv: ServiceInvoice) => inv.createdAt.split("T")[0] === today
            );
            const pendingServices = loadedServiceInstances.filter(
                (si: any) => !si.invoiceId && si.branchId === user.branchId
            ).length;

            setStats({
                totalInvoices: branchInvoices.length,
                totalRevenue: branchInvoices.reduce((sum: number, inv: ServiceInvoice) => sum + inv.total, 0),
                pendingServices,
                completedToday: todayInvoices.length,
            });
        } catch (error) {
            console.error("Error loading billing data:", error);
        }
    }, [user.branchId]);

    return (
        <div className="min-h-screen bg-background">
            <ReceptionHeader />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Billing & Invoices</h1>
                    <p className="text-muted-foreground">
                        View service invoices and billing statistics for your branch
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Invoices</p>
                                    <p className="text-2xl font-bold">{stats.totalInvoices}</p>
                                </div>
                                <FileText className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                                    <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} VND</p>
                                </div>
                                <DollarSign className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Pending Services</p>
                                    <p className="text-2xl font-bold">{stats.pendingServices}</p>
                                </div>
                                <Clock className="w-8 h-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Completed Today</p>
                                    <p className="text-2xl font-bold">{stats.completedToday}</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common billing tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                onClick={() => navigate("/receptionist/appointments/injections")}
                                variant="outline"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Book Injection Appointment
                            </Button>
                            <Button
                                onClick={() => navigate("/receptionist/booking")}
                                variant="outline"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Book General Appointment
                            </Button>
                            <Button
                                onClick={() => navigate("/receptionist/checkin")}
                                variant="outline"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Check-in Customer
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Service Invoices */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Service Invoices</CardTitle>
                        <CardDescription>Latest invoices created at your branch</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Services</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead>Created By</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {serviceInvoices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No invoices found. Service invoices are created by Sales staff.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    serviceInvoices
                                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                        .slice(0, 10)
                                        .map((invoice) => (
                                            <TableRow key={invoice.id}>
                                                <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                                                <TableCell>{invoice.customerName}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">
                                                        {invoice.serviceInstanceIds.length} service(s)
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {invoice.total.toLocaleString()} VND
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            invoice.paymentMethod === "Cash" ? "default" : "outline"
                                                        }
                                                    >
                                                        {invoice.paymentMethod}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{invoice.salesStaffName}</TableCell>
                                                <TableCell>
                                                    {new Date(invoice.createdAt).toLocaleDateString()}
                                                </TableCell>
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

                        {serviceInvoices.length > 10 && (
                            <div className="mt-4 text-center">
                                <Button variant="outline" size="sm">
                                    View All Invoices
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Info Box */}
                <Card className="mt-6 border-blue-200 bg-blue-50 dark:bg-blue-950">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                    About Service Invoices
                                </h3>
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    Service invoices are created by Sales staff after veterinarians complete
                                    services (injections, medical exams, etc.). As a receptionist, you can:
                                </p>
                                <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
                                    <li>Book appointments for customers</li>
                                    <li>Check-in customers when they arrive</li>
                                    <li>View invoice history and statistics</li>
                                    <li>Assist customers with billing inquiries</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
