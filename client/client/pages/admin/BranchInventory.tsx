import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Package, AlertTriangle } from "lucide-react";
import { BranchInventory, Branch, PetItem, Vaccine, VaccinePackage } from "@shared/types";

export default function BranchInventoryPage() {
    const { user } = useAuth();
    const [inventory, setInventory] = useState<BranchInventory[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [products, setProducts] = useState<PetItem[]>([]);
    const [vaccines, setVaccines] = useState<Vaccine[]>([]);
    const [packages, setPackages] = useState<VaccinePackage[]>([]);
    const [selectedBranch, setSelectedBranch] = useState(user?.branchId || "all");

    if (!user || user.role !== "admin") {
        return <Navigate to="/login" />;
    }

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const invStored = localStorage.getItem("petcare_branch_inventory");
        if (invStored) setInventory(JSON.parse(invStored));

        const branchStored = localStorage.getItem("petcare_branches");
        if (branchStored) setBranches(JSON.parse(branchStored));

        const prodStored = localStorage.getItem("petcare_pet_items");
        if (prodStored) setProducts(JSON.parse(prodStored));

        const vacStored = localStorage.getItem("petcare_vaccines");
        if (vacStored) setVaccines(JSON.parse(vacStored));

        const pkgStored = localStorage.getItem("petcare_vaccine_packages");
        if (pkgStored) setPackages(JSON.parse(pkgStored));
    };

    const getBranchName = (branchId: string) => {
        return branches.find(b => b.id === branchId)?.name || branchId;
    };

    const getProductName = (itemId: string) => {
        return products.find(p => p.id === itemId)?.name || itemId;
    };

    const getVaccineName = (vaccineId: string) => {
        return vaccines.find(v => v.id === vaccineId)?.name || vaccineId;
    };

    const getPackageName = (packageId: string) => {
        return packages.find(p => p.id === packageId)?.name || packageId;
    };

    const filteredInventory = selectedBranch === "all"
        ? inventory
        : inventory.filter(inv => inv.branchId === selectedBranch);

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Branch Inventory Management</h1>
                    <p className="text-muted-foreground">
                        View stock levels of products, vaccines, and packages per branch
                    </p>
                </div>

                <div className="mb-6">
                    <label className="text-sm font-medium mr-2">Filter by Branch:</label>
                    <select
                        className="px-3 py-2 border rounded-md"
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                    >
                        <option value="all">All Branches</option>
                        {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-6">
                    {filteredInventory.length === 0 ? (
                        <Card className="p-8 text-center text-muted-foreground">
                            No inventory data found
                        </Card>
                    ) : (
                        filteredInventory.map((inv) => (
                            <Card key={inv.branchId} className="p-6">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <Package className="w-6 h-6 text-primary" />
                                    {getBranchName(inv.branchId)}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Products */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Products ({inv.products.length})</h3>
                                        <div className="space-y-2">
                                            {inv.products.map((item) => (
                                                <div key={item.itemId} className="p-3 bg-gray-50 rounded-md">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-sm font-medium">{getProductName(item.itemId)}</span>
                                                        {item.quantity <= item.reorderPoint && (
                                                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Quantity: <span className="font-medium">{item.quantity}</span> |
                                                        Reorder: {item.reorderPoint} |
                                                        Min: {item.minStock} |
                                                        Max: {item.maxStock}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Vaccines */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Vaccines ({inv.vaccines.length})</h3>
                                        <div className="space-y-2">
                                            {inv.vaccines.map((item) => (
                                                <div key={item.itemId} className="p-3 bg-blue-50 rounded-md">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-sm font-medium">{getVaccineName(item.itemId)}</span>
                                                        {item.quantity <= item.reorderPoint && (
                                                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Quantity: <span className="font-medium">{item.quantity}</span> |
                                                        Reorder: {item.reorderPoint} |
                                                        Min: {item.minStock} |
                                                        Max: {item.maxStock}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Vaccine Packages */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Vaccine Packages ({inv.vaccinePackages.length})</h3>
                                        <div className="space-y-2">
                                            {inv.vaccinePackages.map((item) => (
                                                <div key={item.itemId} className="p-3 bg-green-50 rounded-md">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-sm font-medium">{getPackageName(item.itemId)}</span>
                                                        {item.quantity <= item.reorderPoint && (
                                                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Quantity: <span className="font-medium">{item.quantity}</span> |
                                                        Reorder: {item.reorderPoint} |
                                                        Min: {item.minStock} |
                                                        Max: {item.maxStock}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 text-xs text-muted-foreground">
                                    Last Updated: {new Date(inv.lastUpdated).toLocaleString()}
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
