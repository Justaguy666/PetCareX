import SalesHeader from "@/components/SalesHeader";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { mockInvoices } from "@/lib/mockData";
import { FileText, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Invoice() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [items, setItems] = useState("");
    const [total, setTotal] = useState("");
    const [notes, setNotes] = useState("");

    if (!user || user.role !== "sales") return <Navigate to="/login" />;

    const handleCreateInvoice = () => {
        if (!customerName || !customerPhone || !items || !total) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        toast({
            title: "Invoice Created",
            description: "Invoice has been created successfully.",
        });

        // Reset form
        setCustomerName("");
        setCustomerPhone("");
        setItems("");
        setTotal("");
        setNotes("");
        setShowForm(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "paid": return "bg-green-600";
            case "pending": return "bg-yellow-600";
            case "overdue": return "bg-red-600";
            default: return "bg-gray-600";
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <SalesHeader />
            <main className="container mx-auto px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Invoice Management</h1>
                        <p className="text-muted-foreground">Create and manage customer invoices</p>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)}>
                        <Plus className="h-4 w-4 mr-2" />
                        {showForm ? "Hide Form" : "Create Invoice"}
                    </Button>
                </div>

                {/* Invoice Form */}
                {showForm && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>New Invoice</CardTitle>
                            <CardDescription>Fill in the details to create a new invoice</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="customerName">Customer Name</Label>
                                    <Input
                                        id="customerName"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Enter customer name"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="customerPhone">Phone Number</Label>
                                    <Input
                                        id="customerPhone"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        placeholder="Enter phone number"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="items">Items</Label>
                                    <Textarea
                                        id="items"
                                        value={items}
                                        onChange={(e) => setItems(e.target.value)}
                                        placeholder="List items (e.g., Premium Dog Food x2, Pet Vitamins x1)"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="total">Total Amount (VND)</Label>
                                    <Input
                                        id="total"
                                        type="number"
                                        value={total}
                                        onChange={(e) => setTotal(e.target.value)}
                                        placeholder="Enter total amount"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                    <Input
                                        id="notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add any notes"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button onClick={handleCreateInvoice}>Create Invoice</Button>
                                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Invoice History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Invoice History
                        </CardTitle>
                        <CardDescription>View all invoices and their status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Total (VND)</TableHead>
                                        <TableHead>Staff</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockInvoices.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-mono">{invoice.id}</TableCell>
                                            <TableCell>Customer #{invoice.customerId.slice(-4)}</TableCell>
                                            <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>{invoice.total.toLocaleString()}</TableCell>
                                            <TableCell>{user.fullName}</TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(invoice.status)}>
                                                    {invoice.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {mockInvoices.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                                No invoices found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
