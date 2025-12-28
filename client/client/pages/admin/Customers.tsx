import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers, useBranches } from "@/hooks/useHospitalData";
import {
    Users,
    Mail,
    Phone,
    Award,
    DollarSign,
    Calendar,
    Eye,
    RefreshCw,
    TrendingUp,
    Search
} from "lucide-react";
import { useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import {
    getMembershipBadgeClass,
    getMembershipIcon,
    recalculateAllMemberships,
    MEMBERSHIP_THRESHOLDS
} from "@/lib/membershipUtils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { User, Invoice, ServiceInvoice } from "@shared/types";
import { useToast } from "@/hooks/use-toast";

export default function CustomersPage() {
    const { user } = useAuth();
    const { users, updateUser } = useUsers();
    const { branches } = useBranches();
    const { toast } = useToast();

    const [searchTerm, setSearchTerm] = useState("");
    const [viewingCustomer, setViewingCustomer] = useState<User | null>(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    if (!user) {
        return <Navigate to="/login" />;
    }

    // Get all customers
    const customers = useMemo(() => {
        return users.filter((u) => u.role === "customer");
    }, [users]);

    // Filter by search only
    const filteredCustomers = useMemo(() => {
        if (!searchTerm) {
            return customers;
        }

        const searchLower = searchTerm.toLowerCase();
        return customers.filter((customer) =>
            customer.fullName?.toLowerCase().includes(searchLower) ||
            customer.email?.toLowerCase().includes(searchLower) ||
            customer.phone?.toLowerCase().includes(searchLower)
        );
    }, [customers, searchTerm]);

    // Get customer's last invoice date
    const getLastInvoiceDate = (customerId: string): string => {
        const productInvoices: Invoice[] = JSON.parse(
            localStorage.getItem("petcare_product_invoices") || "[]"
        );
        const serviceInvoices: ServiceInvoice[] = JSON.parse(
            localStorage.getItem("petcare_service_invoices") || "[]"
        );

        const allInvoices = [
            ...productInvoices.filter((inv) => inv.customerId === customerId),
            ...serviceInvoices.filter((inv) => inv.customerId === customerId),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        if (allInvoices.length === 0) return "Never";

        const lastDate = new Date(allInvoices[0].createdAt);
        return lastDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    // Get customer's spending history for current year
    const getCustomerSpendingHistory = (customerId: string) => {
        const productInvoices: Invoice[] = JSON.parse(
            localStorage.getItem("petcare_product_invoices") || "[]"
        );
        const serviceInvoices: ServiceInvoice[] = JSON.parse(
            localStorage.getItem("petcare_service_invoices") || "[]"
        );

        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);

        const productHistory = productInvoices
            .filter((inv) => {
                const invDate = new Date(inv.createdAt);
                return inv.customerId === customerId && invDate >= startOfYear;
            })
            .map((inv) => ({
                id: inv.id,
                date: inv.createdAt,
                type: "Product" as const,
                amount: inv.total,
                items: inv.items?.length || 0,
            }));

        const serviceHistory = serviceInvoices
            .filter((inv) => {
                const invDate = new Date(inv.createdAt);
                return inv.customerId === customerId && invDate >= startOfYear;
            })
            .map((inv) => ({
                id: inv.id,
                date: inv.createdAt,
                type: "Service" as const,
                amount: inv.total,
                items: 1,
            }));

        const allHistory = [...productHistory, ...serviceHistory].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Calculate running total
        let runningTotal = 0;
        return allHistory.map((item) => {
            runningTotal += item.amount;
            return {
                ...item,
                runningTotal,
            };
        });
    };

    // Handle recalculate all memberships
    const handleRecalculateAll = () => {
        const result = recalculateAllMemberships();

        if (result.success) {
            toast({
                title: "✅ Recalculation Complete",
                description: `Updated ${result.updated} customers. ${result.upgraded} upgraded, ${result.downgraded} downgraded.`,
            });

            // Refresh users list
            window.location.reload();
        } else {
            toast({
                title: "❌ Recalculation Failed",
                description: `Errors: ${result.errors}`,
                variant: "destructive",
            });
        }
    };

    // Handle view spending history
    const handleViewHistory = (customer: User) => {
        setViewingCustomer(customer);
        setShowHistoryModal(true);
    };

    // Get membership stats - based on filtered customers
    const membershipStats = useMemo(() => {
        const stats = {
            total: filteredCustomers.length,
            basic: 0,
            loyal: 0,
            vip: 0,
        };

        filteredCustomers.forEach((customer) => {
            if (customer.membershipLevel === "VIP") stats.vip++;
            else if (customer.membershipLevel === "Thân thiết") stats.loyal++;
            else stats.basic++;
        });

        return stats;
    }, [filteredCustomers]);

    return (
        <AdminLayout>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground mb-2">Customer Management</h1>
                        <p className="text-muted-foreground">
                            Manage customer accounts and membership levels
                        </p>
                    </div>
                    <Button
                        onClick={handleRecalculateAll}
                        className="bg-primary hover:bg-primary/90 text-white"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Recalculate All Memberships
                    </Button>
                </div>

                {/* Membership Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4 border border-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Customers</p>
                                <p className="text-2xl font-bold text-foreground">{membershipStats.total}</p>
                            </div>
                            <Users className="w-10 h-10 text-primary/30" />
                        </div>
                    </Card>

                    <Card className="p-4 border border-border bg-gradient-to-br from-gray-50 to-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Basic Members</p>
                                <p className="text-2xl font-bold text-gray-700">{membershipStats.basic}</p>
                            </div>
                            <Badge className="bg-gray-500">📋</Badge>
                        </div>
                    </Card>

                    <Card className="p-4 border border-border bg-gradient-to-br from-blue-50 to-indigo-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Loyal Members</p>
                                <p className="text-2xl font-bold text-blue-700">{membershipStats.loyal}</p>
                            </div>
                            <Badge className="bg-blue-600">⭐</Badge>
                        </div>
                    </Card>

                    <Card className="p-4 border border-border bg-gradient-to-br from-amber-50 to-yellow-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">VIP Members</p>
                                <p className="text-2xl font-bold text-amber-700">{membershipStats.vip}</p>
                            </div>
                            <Badge className="bg-gradient-to-r from-yellow-600 to-amber-600">👑</Badge>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="p-4 mb-6 border border-border">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-sm font-medium text-foreground block mb-2">
                                Search Customers
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name, email, or phone..."
                                    className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Customer Table */}
                <Card className="border border-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Membership</TableHead>
                                <TableHead className="text-right">Yearly Spending</TableHead>
                                <TableHead>Last Invoice</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCustomers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12">
                                        <p className="text-muted-foreground">No customers found</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCustomers.map((customer) => {
                                    // Use yearlySpending from customer object for display
                                    const yearlySpending = customer.yearlySpending || 0;
                                    const lastInvoiceDate = getLastInvoiceDate(customer.id);
                                    const branch = customer.branchId
                                        ? branches.find((b) => b.id === customer.branchId)
                                        : null;

                                    return (
                                        <TableRow key={customer.id} className="hover:bg-muted/50">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-lg">
                                                        👤
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-foreground">
                                                            {customer.fullName}
                                                        </p>
                                                        {branch && (
                                                            <p className="text-xs text-muted-foreground">
                                                                📍 {branch.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="space-y-1 text-sm">
                                                    {customer.email && (
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Mail className="w-3 h-3" />
                                                            {customer.email}
                                                        </div>
                                                    )}
                                                    {customer.phone && (
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Phone className="w-3 h-3" />
                                                            {customer.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <Badge
                                                    className={getMembershipBadgeClass(
                                                        customer.membershipLevel || "Cơ bản"
                                                    )}
                                                >
                                                    {getMembershipIcon(customer.membershipLevel || "Cơ bản")}{" "}
                                                    {customer.membershipLevel || "Cơ bản"}
                                                </Badge>
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-end">
                                                    <p className="font-semibold text-foreground">
                                                        {yearlySpending.toLocaleString()} VNĐ
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date().getFullYear()}
                                                    </p>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="w-4 h-4" />
                                                    {lastInvoiceDate}
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleViewHistory(customer)}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View History
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            {/* Spending History Modal */}
            <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Spending History - {viewingCustomer?.fullName}
                        </DialogTitle>
                        <DialogDescription>
                            Year {new Date().getFullYear()} transaction history and membership progress
                        </DialogDescription>
                    </DialogHeader>

                    {viewingCustomer && (
                        <div className="space-y-6">
                            {/* Customer Summary */}
                            <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Current Membership</p>
                                        <Badge
                                            className={getMembershipBadgeClass(
                                                viewingCustomer.membershipLevel || "Cơ bản"
                                            )}
                                        >
                                            {getMembershipIcon(viewingCustomer.membershipLevel || "Cơ bản")}{" "}
                                            {viewingCustomer.membershipLevel || "Cơ bản"}
                                        </Badge>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Yearly Spending</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {(viewingCustomer.yearlySpending || 0).toLocaleString()} VNĐ
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Loyalty Points</p>
                                        <p className="text-2xl font-bold text-primary">
                                            {viewingCustomer.loyaltyPoints || 0} pts
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Membership Thresholds Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Card className="p-3 border-2 border-gray-300 bg-gray-50">
                                    <p className="text-xs font-semibold text-gray-600 mb-1">📋 Basic</p>
                                    <p className="text-sm text-gray-700">Default tier</p>
                                </Card>

                                <Card className="p-3 border-2 border-blue-300 bg-blue-50">
                                    <p className="text-xs font-semibold text-blue-600 mb-1">⭐ Loyal</p>
                                    <p className="text-sm text-blue-700">
                                        ≥ {(MEMBERSHIP_THRESHOLDS.LOYAL_UPGRADE / 1000000).toFixed(0)}M to upgrade
                                    </p>
                                    <p className="text-xs text-blue-600">
                                        ≥ {(MEMBERSHIP_THRESHOLDS.LOYAL_MAINTAIN / 1000000).toFixed(0)}M to maintain
                                    </p>
                                </Card>

                                <Card className="p-3 border-2 border-amber-300 bg-amber-50">
                                    <p className="text-xs font-semibold text-amber-600 mb-1">👑 VIP</p>
                                    <p className="text-sm text-amber-700">
                                        ≥ {(MEMBERSHIP_THRESHOLDS.VIP_UPGRADE / 1000000).toFixed(0)}M to upgrade
                                    </p>
                                    <p className="text-xs text-amber-600">
                                        ≥ {(MEMBERSHIP_THRESHOLDS.VIP_MAINTAIN / 1000000).toFixed(0)}M to maintain
                                    </p>
                                </Card>
                            </div>

                            {/* Transaction History */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <DollarSign className="w-5 h-5" />
                                    Transaction History ({new Date().getFullYear()})
                                </h3>

                                <div className="border border-border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                                <TableHead className="text-right">Running Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {getCustomerSpendingHistory(viewingCustomer.id).length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8">
                                                        <p className="text-muted-foreground">
                                                            No transactions in {new Date().getFullYear()}
                                                        </p>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                getCustomerSpendingHistory(viewingCustomer.id).map((transaction, idx) => (
                                                    <TableRow key={transaction.id} className="hover:bg-muted/50">
                                                        <TableCell>
                                                            {new Date(transaction.date).toLocaleDateString("en-US", {
                                                                year: "numeric",
                                                                month: "short",
                                                                day: "numeric",
                                                            })}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={transaction.type === "Product" ? "default" : "secondary"}
                                                            >
                                                                {transaction.type}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right font-semibold text-green-600">
                                                            +{transaction.amount.toLocaleString()} VNĐ
                                                        </TableCell>
                                                        <TableCell className="text-right font-bold text-foreground">
                                                            {transaction.runningTotal.toLocaleString()} VNĐ
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
