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
import { VaccineInventory, Vaccine, Branch } from "@shared/types";
import { Syringe, Search, Pencil, AlertTriangle, TrendingDown } from "lucide-react";
import {
    getStockStatus,
    getStockBadgeClass,
    updateVaccineInventory,
    getVaccineStockAlerts,
} from "@/lib/inventoryUtils";
import { useToast } from "@/hooks/use-toast";

interface InventoryWithDetails extends VaccineInventory {
    vaccineName: string;
    branchName: string;
    manufacturer: string;
    price: number;
}

export default function VaccineInventoryManagement() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [inventory, setInventory] = useState<InventoryWithDetails[]>([]);
    const [vaccines, setVaccines] = useState<Vaccine[]>([]);
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
            const invData: VaccineInventory[] = JSON.parse(
                localStorage.getItem("petcare_vaccine_inventory") || "[]"
            );
            const vacData: Vaccine[] = JSON.parse(
                localStorage.getItem("petcare_vaccines") || "[]"
            );
            const branchData: Branch[] = JSON.parse(
                localStorage.getItem("petcare_branches") || "[]"
            );

            const enriched: InventoryWithDetails[] = invData.map((inv) => {
                const vaccine = vacData.find((v) => v.id === inv.vaccineId);
                const branch = branchData.find((b) => b.id === inv.branchId);

                return {
                    ...inv,
                    vaccineName: vaccine?.name || "Unknown",
                    branchName: branch?.name || "Unknown",
                    manufacturer: vaccine?.manufacturer || "",
                    price: vaccine?.price || 0,
                };
            });

            setInventory(enriched);
            setVaccines(vacData);
            setBranches(branchData);
        } catch (error) {
            console.error("Error loading vaccine inventory:", error);
            toast({
                title: "Error",
                description: "Failed to load vaccine inventory data",
                variant: "destructive",
            });
        }
    };

    const filteredInventory = useMemo(() => {
        return inventory.filter((item) => {
            const matchesSearch =
                item.vaccineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesBranch =
                selectedBranch === "all" || item.branchId === selectedBranch;

            const status = getStockStatus(item.quantity);
            const matchesStatus =
                selectedStatus === "all" || status === selectedStatus;

            return matchesSearch && matchesBranch && matchesStatus;
        });
    }, [inventory, searchQuery, selectedBranch, selectedStatus]);

    const summaryStats = useMemo(() => {
        const alerts = getVaccineStockAlerts();
        const lowStock = alerts.filter((a) => a.status === "low").length;
        const criticalStock = alerts.filter((a) => a.status === "critical").length;
        const outOfStock = alerts.filter((a) => a.status === "out").length;
        const totalDoses = inventory.reduce((sum, item) => sum + item.quantity, 0);

        return { lowStock, criticalStock, outOfStock, totalDoses };
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

        const success = updateVaccineInventory(
            editingItem.branchId,
            editingItem.vaccineId,
            qty
        );

        if (success) {
            toast({
                title: "Inventory Updated",
                description: `${editingItem.vaccineName} stock updated to ${qty} doses`,
            });
            setEditModalOpen(false);
            loadData();
        } else {
            toast({
                title: "Update Failed",
                description: "Failed to update vaccine inventory",
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
                        <h1 className="text-3xl font-bold text-gray-900">Vaccine Inventory Management</h1>
                        <p className="text-gray-600 mt-1">Manage vaccine stock levels across branches</p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Doses Available</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <Syringe className="h-5 w-5 text-blue-600" />
                                    <div className="text-2xl font-bold text-blue-600">
                                        {summaryStats.totalDoses}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Doses</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Low Stock Vaccines</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <TrendingDown className="h-5 w-5 text-orange-600" />
                                    <div className="text-2xl font-bold text-orange-600">
                                        {summaryStats.lowStock}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Vaccines</p>
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
                                <p className="text-sm text-gray-500 mt-1">Vaccines</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Out of Stock</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <Syringe className="h-5 w-5 text-gray-600" />
                                    <div className="text-2xl font-bold text-gray-600">
                                        {summaryStats.outOfStock}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Vaccines</p>
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
                                        placeholder="Search vaccines or branches..."
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
                            <CardTitle>Vaccine Inventory ({filteredInventory.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Vaccine</TableHead>
                                            <TableHead>Manufacturer</TableHead>
                                            <TableHead>Branch</TableHead>
                                            <TableHead className="text-right">Unit Price</TableHead>
                                            <TableHead className="text-right">Doses Available</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Last Updated</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredInventory.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                                    No vaccine inventory found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredInventory.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{item.vaccineName}</TableCell>
                                                    <TableCell>{item.manufacturer}</TableCell>
                                                    <TableCell>{item.branchName}</TableCell>
                                                    <TableCell className="text-right">
                                                        ${item.price.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold">
                                                        {item.quantity}
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(item.quantity)}</TableCell>
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
                        <DialogTitle>Update Vaccine Stock</DialogTitle>
                    </DialogHeader>
                    {editingItem && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Vaccine</p>
                                <p className="font-medium">{editingItem.vaccineName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Manufacturer</p>
                                <p className="font-medium">{editingItem.manufacturer}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Branch</p>
                                <p className="font-medium">{editingItem.branchName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Current Stock</p>
                                <p className="font-semibold text-lg">{editingItem.quantity} doses</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    New Quantity (doses)
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
