import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useInvoices, useBranches, useUsers } from "@/hooks/useHospitalData";
import { Edit, Trash2, Plus, Search, Eye, DollarSign, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Invoice, InvoiceItem, InvoiceStatus } from "@shared/types";

export default function InvoicesPage() {
    const { user } = useAuth();
    const { invoices, createInvoice, updateInvoice, deleteInvoice } = useInvoices();
    const { branches } = useBranches();
    const { users } = useUsers();
    const { toast } = useToast();
    // Default to admin's branch
    const [selectedBranch, setSelectedBranch] = useState(user?.branchId || "all");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showForm, setShowForm] = useState(false);
    const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        customerId: "",
        branchId: user?.branchId || "",
        status: "pending" as InvoiceStatus,
        dueDate: "",
        paymentMethod: "",
        notes: "",
    });
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

    if (!user) {
        return <Navigate to="/login" />;
    }

    const customers = users.filter((u) => u.role === "customer");
    const statuses: InvoiceStatus[] = ["draft", "pending", "paid", "overdue", "cancelled"];

    const branchFilteredInvoices =
        selectedBranch === "all"
            ? invoices
            : invoices.filter((inv) => inv.branchId === selectedBranch);

    const statusFilteredInvoices =
        statusFilter === "all"
            ? branchFilteredInvoices
            : branchFilteredInvoices.filter((inv) => inv.status === statusFilter);

    const filteredInvoices = statusFilteredInvoices.filter((invoice) => {
        const customer = users.find((u) => u.id === invoice.customerId);
        const searchLower = searchTerm.toLowerCase();
        return (
            invoice.id.toLowerCase().includes(searchLower) ||
            customer?.fullName.toLowerCase().includes(searchLower) ||
            invoice.total.toString().includes(searchLower)
        );
    });

    const overdueInvoices = filteredInvoices.filter(
        (inv) => inv.status === "pending" && new Date(inv.dueDate) < new Date()
    );

    const handleView = (invoiceId: string) => {
        setViewInvoiceId(invoiceId);
    };

    const handleEdit = (invoice: Invoice) => {
        setEditingId(invoice.id);
        setFormData({
            customerId: invoice.customerId || "",
            branchId: invoice.branchId || "",
            status: invoice.status || "pending",
            dueDate: invoice.dueDate || "",
            paymentMethod: invoice.paymentMethod || "",
            notes: invoice.notes || "",
        });
        setInvoiceItems(invoice.items || []);
        setShowForm(true);
    };

    const handleAddItem = () => {
        const newItem: InvoiceItem = {
            id: `item-${Date.now()}`,
            description: "",
            quantity: 1,
            unitPrice: 0,
            total: 0,
            type: "service",
        };
        setInvoiceItems([...invoiceItems, newItem]);
    };

    const handleUpdateItem = (index: number, field: keyof InvoiceItem, value: any) => {
        const updatedItems = [...invoiceItems];
        updatedItems[index] = { ...updatedItems[index], [field]: value };

        if (field === "quantity" || field === "unitPrice") {
            updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
        }

        setInvoiceItems(updatedItems);
    };

    const handleRemoveItem = (index: number) => {
        setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    };

    const calculateTotals = () => {
        const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax;
        return { subtotal, tax, total };
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (invoiceItems.length === 0) {
            toast({
                title: "Error",
                description: "Please add at least one item to the invoice.",
                variant: "destructive",
            });
            return;
        }

        const { subtotal, tax, total } = calculateTotals();

        const invoiceData = {
            ...formData,
            items: invoiceItems,
            subtotal,
            tax,
            total,
        };

        if (editingId) {
            updateInvoice(editingId, invoiceData);
            toast({
                title: "Invoice Updated",
                description: "Invoice has been updated successfully.",
            });
        } else {
            createInvoice(invoiceData);
            toast({
                title: "Invoice Created",
                description: "New invoice has been created successfully.",
            });
        }

        handleCancel();
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            customerId: "",
            branchId: user?.branchId || "",
            status: "pending",
            dueDate: "",
            paymentMethod: "",
            notes: "",
        });
        setInvoiceItems([]);
    };

    const handleDelete = (invoiceId: string) => {
        if (confirm("Are you sure you want to delete this invoice?")) {
            deleteInvoice(invoiceId);
            toast({
                title: "Invoice Deleted",
                description: "Invoice has been removed successfully.",
            });
        }
    };

    const getStatusColor = (status: InvoiceStatus) => {
        const colors: Record<InvoiceStatus, string> = {
            draft: "bg-gray-100 text-gray-700",
            pending: "bg-yellow-100 text-yellow-700",
            paid: "bg-green-100 text-green-700",
            overdue: "bg-red-100 text-red-700",
            cancelled: "bg-gray-100 text-gray-700",
        };
        return colors[status];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const viewInvoice = viewInvoiceId ? invoices.find((inv) => inv.id === viewInvoiceId) : null;
    const viewCustomer = viewInvoice ? users.find((u) => u.id === viewInvoice.customerId) : null;

    return (
        <AdminLayout>
            <main className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Invoices Management</h1>
                    <p className="text-muted-foreground">View and manage customer invoices</p>
                </div>

                {/* Overdue Alert */}
                {overdueInvoices.length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-red-900">
                                {overdueInvoices.length} overdue invoice(s)
                            </p>
                            <p className="text-sm text-red-700">These invoices require immediate attention</p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Filters</CardTitle>
                            <Button
                                onClick={() => setShowForm(!showForm)}
                                className="bg-primary hover:bg-primary/90 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Invoice
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div>
                                <label className="text-sm font-medium text-foreground block mb-2">
                                    Filter by Branch
                                </label>
                                <select
                                    value={selectedBranch}
                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                    className="px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="all">All Branches</option>
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-foreground block mb-2">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="all">All Status</option>
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    type="text"
                                    placeholder="Search by invoice ID, customer, or amount..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Add/Edit Form */}
                {showForm && (
                    <Card className="mb-6 border border-border bg-primary/5">
                        <CardHeader>
                            <CardTitle>{editingId ? "Edit Invoice" : "Create New Invoice"}</CardTitle>
                            <CardDescription>
                                {editingId ? "Update invoice information" : "Enter details for the new invoice"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-2">
                                            Customer *
                                        </label>
                                        <select
                                            value={formData.customerId}
                                            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                            className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            required
                                        >
                                            <option value="">Select Customer</option>
                                            {customers.map((customer) => (
                                                <option key={customer.id} value={customer.id}>
                                                    {customer.fullName} - {customer.email}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-2">
                                            Branch *
                                        </label>
                                        <select
                                            value={formData.branchId}
                                            onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                                            className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            required
                                        >
                                            <option value="">Select Branch</option>
                                            {branches.map((branch) => (
                                                <option key={branch.id} value={branch.id}>
                                                    {branch.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-2">
                                            Status *
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) =>
                                                setFormData({ ...formData, status: e.target.value as InvoiceStatus })
                                            }
                                            className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            required
                                        >
                                            {statuses.map((status) => (
                                                <option key={status} value={status}>
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-2">
                                            Due Date *
                                        </label>
                                        <Input
                                            type="date"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-2">
                                            Payment Method
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.paymentMethod}
                                            onChange={(e) =>
                                                setFormData({ ...formData, paymentMethod: e.target.value })
                                            }
                                            placeholder="Cash, Credit Card, etc."
                                        />
                                    </div>
                                </div>

                                {/* Invoice Items */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold">Invoice Items</h3>
                                        <Button type="button" variant="outline" onClick={handleAddItem}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Item
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {invoiceItems.map((item, index) => (
                                            <div key={item.id} className="grid grid-cols-12 gap-2 p-3 border rounded-lg">
                                                <div className="col-span-4">
                                                    <Input
                                                        type="text"
                                                        value={item.description}
                                                        onChange={(e) =>
                                                            handleUpdateItem(index, "description", e.target.value)
                                                        }
                                                        placeholder="Description"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <select
                                                        value={item.type}
                                                        onChange={(e) => handleUpdateItem(index, "type", e.target.value)}
                                                        className="w-full px-2 py-2 border border-input rounded-lg"
                                                    >
                                                        <option value="service">Service</option>
                                                        <option value="medication">Medication</option>
                                                        <option value="product">Product</option>
                                                    </select>
                                                </div>
                                                <div className="col-span-2">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            handleUpdateItem(index, "quantity", parseInt(e.target.value) || 1)
                                                        }
                                                        placeholder="Qty"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={item.unitPrice}
                                                        onChange={(e) =>
                                                            handleUpdateItem(index, "unitPrice", parseFloat(e.target.value) || 0)
                                                        }
                                                        placeholder="Price"
                                                    />
                                                </div>
                                                <div className="col-span-1 flex items-center">
                                                    <span className="text-sm font-medium">${item.total.toFixed(2)}</span>
                                                </div>
                                                <div className="col-span-1 flex items-center">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveItem(index)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {invoiceItems.length > 0 && (
                                        <div className="mt-4 border-t pt-4">
                                            <div className="flex justify-end space-y-2 flex-col items-end">
                                                <div className="flex gap-4">
                                                    <span className="text-sm font-medium">Subtotal:</span>
                                                    <span className="text-sm">${calculateTotals().subtotal.toFixed(2)}</span>
                                                </div>
                                                <div className="flex gap-4">
                                                    <span className="text-sm font-medium">Tax (10%):</span>
                                                    <span className="text-sm">${calculateTotals().tax.toFixed(2)}</span>
                                                </div>
                                                <div className="flex gap-4 text-lg font-bold">
                                                    <span>Total:</span>
                                                    <span>${calculateTotals().total.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Additional notes..."
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                                        {editingId ? "Update Invoice" : "Create Invoice"}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Invoices Table */}
                <Card className="border border-border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInvoices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                        No invoices yet
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredInvoices.map((invoice) => {
                                    const customer = users.find((u) => u.id === invoice.customerId);
                                    const branch = branches.find((b) => b.id === invoice.branchId);
                                    const isOverdue =
                                        invoice.status === "pending" && new Date(invoice.dueDate) < new Date();
                                    return (
                                        <TableRow key={invoice.id} className="hover:bg-gray-50">
                                            <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                                            <TableCell>{customer?.fullName || "N/A"}</TableCell>
                                            <TableCell>{branch?.name || "N/A"}</TableCell>
                                            <TableCell className="font-semibold">${invoice.total.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(isOverdue ? "overdue" : invoice.status)}>
                                                    {isOverdue ? "Overdue" : invoice.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className={isOverdue ? "text-red-600 font-semibold" : ""}>
                                                    {formatDate(invoice.dueDate)}
                                                </span>
                                            </TableCell>
                                            <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleView(invoice.id)}
                                                        className="h-8"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEdit(invoice)}
                                                        className="h-8"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDelete(invoice.id)}
                                                        className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </Card>

                {/* View Invoice Dialog */}
                <Dialog open={!!viewInvoiceId} onOpenChange={() => setViewInvoiceId(null)}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Invoice Details</DialogTitle>
                            <DialogDescription>Complete invoice information</DialogDescription>
                        </DialogHeader>
                        {viewInvoice && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Invoice ID</p>
                                        <p className="font-mono">{viewInvoice.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                                        <Badge className={getStatusColor(viewInvoice.status)}>
                                            {viewInvoice.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Customer</p>
                                        <p>{viewCustomer?.fullName || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                                        <p>{formatDate(viewInvoice.dueDate)}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2">Items</h4>
                                    <div className="border rounded-lg">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Description</TableHead>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>Qty</TableHead>
                                                    <TableHead>Price</TableHead>
                                                    <TableHead>Total</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {viewInvoice.items.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell>{item.description}</TableCell>
                                                        <TableCell className="capitalize">{item.type || "N/A"}</TableCell>
                                                        <TableCell>{item.quantity}</TableCell>
                                                        <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                                                        <TableCell>${item.total.toFixed(2)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex justify-end space-y-2 flex-col items-end">
                                        <div className="flex gap-4">
                                            <span className="font-medium">Subtotal:</span>
                                            <span>${viewInvoice.subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <span className="font-medium">Tax:</span>
                                            <span>${viewInvoice.tax.toFixed(2)}</span>
                                        </div>
                                        <div className="flex gap-4 text-lg font-bold">
                                            <span>Total:</span>
                                            <span>${viewInvoice.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {viewInvoice.notes && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                                        <p className="text-sm">{viewInvoice.notes}</p>
                                    </div>
                                )}
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setViewInvoiceId(null)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </AdminLayout>
    );
}
