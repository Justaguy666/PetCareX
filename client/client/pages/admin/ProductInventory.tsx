import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminHeader from "@/components/AdminHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState, useEffect, useMemo } from "react";
import { ProductInventory, PetItem, Branch } from "@shared/types";
import { Package, Search, Plus, Pencil, AlertTriangle, TrendingDown } from "lucide-react";
import {
    getStockStatus,
    getStockBadgeClass,
    updateProductInventory,
    getProductStockAlerts,
} from "@/lib/inventoryUtils";
import { useToast } from "@/hooks/use-toast";

interface InventoryWithDetails extends ProductInventory {
    productName: string;
    branchName: string;
    category: string;
    price: number;
}

export default function ProductInventoryManagement() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [inventory, setInventory] = useState<InventoryWithDetails[]>([]);
    const [products, setProducts] = useState<PetItem[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBranch, setSelectedBranch] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");

    // Edit modal
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryWithDetails | null>(null);
    const [newQuantity, setNewQuantity] = useState("");

    if (!user || user.role !== "admin") {
        return <Navigate to="/login" />;
    }

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        try {
            const invData: ProductInventory[] = JSON.parse(
                localStorage.getItem("petcare_product_inventory") || "[]"
            );
            const prodData: PetItem[] = JSON.parse(
                localStorage.getItem("petcare_pet_items") || "[]"
            );
            const branchData: Branch[] = JSON.parse(
                localStorage.getItem("petcare_branches") || "[]"
            );

            const enriched: InventoryWithDetails[] = invData.map((inv) => {
                const product = prodData.find((p) => p.id === inv.productId);
                const branch = branchData.find((b) => b.id === inv.branchId);

                return {
                    ...inv,
                    productName: product?.name || "Unknown",
                    branchName: branch?.name || "Unknown",
                    category: product?.category || "",
                    price: product?.price || 0,
                };
            });

            setInventory(enriched);
            setProducts(prodData);
            setBranches(branchData);
        } catch (error) {
            console.error("Error loading inventory:", error);
            toast({
                title: "Error",
                description: "Failed to load inventory data",
                variant: "destructive",
            });
        }
    };

    const filteredInventory = useMemo(() => {
        return inventory.filter((item) => {
            const matchesSearch =
                item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.branchName.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesBranch =
                selectedBranch === "all" || item.branchId === selectedBranch;

            const status = getStockStatus(item.quantity);
            const matchesStatus =
                selectedStatus === "all" || status === selectedStatus;

            return matchesSearch && matchesBranch && matchesStatus;
        });
    }, [inventory, searchQuery, selectedBranch, selectedStatus]);

    const summaryStats = useMemo(() => {
        const alerts = getProductStockAlerts();
        const lowStock = alerts.filter((a) => a.status === "low").length;
        const criticalStock = alerts.filter((a) => a.status === "critical").length;
        const outOfStock = alerts.filter((a) => a.status === "out").length;
        const totalValue = inventory.reduce(
            (sum, item) => sum + item.quantity * item.price,
            0
        );

        return { lowStock, criticalStock, outOfStock, totalValue };
    }, [inventory]);

    const handleEdit = (item: InventoryWithDetails) => {
        setEditingItem(item);
        setNewQuantity(item.quantity.toString());
        setEditModalOpen(true);
    };

    const handleSaveEdit = () => {
        if (!editingItem || !newQuantity) return;

        const qty = parseInt(newQuantity);
        if (isNaN(qty) || qty < 0) {
            toast({
                title: "Invalid Quantity",
                description: "Please enter a valid positive number",
                variant: "destructive",
            });
            return;
        }

        const success = updateProductInventory(
            editingItem.branchId,
            editingItem.productId,
            qty
        );

        if (success) {
            toast({
                title: "Inventory Updated",
                description: `${editingItem.productName} stock updated to ${qty} units`,
            });
            setEditModalOpen(false);
            loadData();
        } else {
            toast({
                title: "Update Failed",
                description: "Failed to update inventory",
                variant: "destructive",
            });
        }
    };

    const getStatusBadge = (quantity: number) => {
        const status = getStockStatus(quantity);
        const badgeClass = getStockBadgeClass(status);
        const labels = {
            normal: "In Stock",
            low: "Low Stock",
            critical: "Critical",
            out: "Out of Stock",
        };

        return (
            <Badge variant="outline" className={badgeClass}>
                {labels[status]}
            </Badge>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminHeader />

            <div className="lg:ml-64">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Product Inventory Management</h1>
                        <p className="text-gray-600 mt-1">Manage product stock levels across branches</p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Inventory Value</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    ${summaryStats.totalValue.toLocaleString()}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">VND</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Low Stock Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <TrendingDown className="h-5 w-5 text-orange-600" />
                                    <div className="text-2xl font-bold text-orange-600">
                                        {summaryStats.lowStock}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Products</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Critical Stock</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    <div className="text-2xl font-bold text-red-600">
                                        {summaryStats.criticalStock}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Products</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Out of Stock</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-gray-600" />
                                    <div className="text-2xl font-bold text-gray-600">
                                        {summaryStats.outOfStock}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Products</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search products or branches..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Branches" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Branches</SelectItem>
                                        {branches.map((branch) => (
                                            <SelectItem key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="normal">In Stock</SelectItem>
                                        <SelectItem value="low">Low Stock</SelectItem>
                                        <SelectItem value="critical">Critical</SelectItem>
                                        <SelectItem value="out">Out of Stock</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedBranch("all");
                                        setSelectedStatus("all");
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Inventory Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Inventory ({filteredInventory.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Branch</TableHead>
                                            <TableHead className="text-right">Unit Price</TableHead>
                                            <TableHead className="text-right">Quantity</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Total Value</TableHead>
                                            <TableHead>Last Updated</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredInventory.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                                    No inventory found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredInventory.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{item.productName}</TableCell>
                                                    <TableCell className="capitalize">{item.category}</TableCell>
                                                    <TableCell>{item.branchName}</TableCell>
                                                    <TableCell className="text-right">
                                                        ${item.price.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold">
                                                        {item.quantity}
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(item.quantity)}</TableCell>
                                                    <TableCell className="text-right font-semibold">
                                                        ${(item.quantity * item.price).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-500">
                                                        {new Date(item.updatedAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(item)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Stock Quantity</DialogTitle>
                    </DialogHeader>
                    {editingItem && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Product</p>
                                <p className="font-medium">{editingItem.productName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Branch</p>
                                <p className="font-medium">{editingItem.branchName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Current Quantity</p>
                                <p className="font-semibold text-lg">{editingItem.quantity} units</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    New Quantity
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={newQuantity}
                                    onChange={(e) => setNewQuantity(e.target.value)}
                                    placeholder="Enter new quantity"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
