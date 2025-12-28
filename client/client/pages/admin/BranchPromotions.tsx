import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { BranchPromotion, Branch, ServiceTypeId, TargetAudience } from "@shared/types";

export default function BranchPromotionsPage() {
    const { user } = useAuth();
    const [promotions, setPromotions] = useState<BranchPromotion[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranch, setSelectedBranch] = useState(user?.branchId || "all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<BranchPromotion | null>(null);
    const [formData, setFormData] = useState({
        branchId: user?.branchId || "",
        description: "",
        targetAudience: "All" as TargetAudience,
        applicableServiceTypes: [] as ServiceTypeId[],
        discountRate: 5,
        startDate: "",
        endDate: "",
    });

    if (!user || user.role !== "admin") {
        return <Navigate to="/login" />;
    }

    useEffect(() => {
        loadPromotions();
        loadBranches();
    }, []);

    const loadPromotions = () => {
        const stored = localStorage.getItem("petcare_branch_promotions");
        if (stored) {
            setPromotions(JSON.parse(stored));
        }
    };

    const loadBranches = () => {
        const stored = localStorage.getItem("petcare_branches");
        if (stored) {
            setBranches(JSON.parse(stored));
        }
    };

    const handleOpenDialog = (promo?: BranchPromotion) => {
        if (promo) {
            setEditingPromo(promo);
            setFormData({
                branchId: promo.branchId,
                description: promo.description,
                targetAudience: promo.targetAudience,
                applicableServiceTypes: promo.applicableServiceTypes,
                discountRate: promo.discountRate,
                startDate: promo.startDate,
                endDate: promo.endDate,
            });
        } else {
            setEditingPromo(null);
            setFormData({
                branchId: user?.branchId || "",
                description: "",
                targetAudience: "All",
                applicableServiceTypes: [],
                discountRate: 5,
                startDate: "",
                endDate: "",
            });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingPromo(null);
    };

    const handleServiceTypeToggle = (type: ServiceTypeId) => {
        setFormData(prev => ({
            ...prev,
            applicableServiceTypes: prev.applicableServiceTypes.includes(type)
                ? prev.applicableServiceTypes.filter(t => t !== type)
                : [...prev.applicableServiceTypes, type]
        }));
    };

    const handleSubmit = () => {
        if (!formData.branchId || !formData.description.trim() || formData.description.length > 500) {
            alert("Please fill in all required fields (description max 500 chars)");
            return;
        }
        if (formData.discountRate < 5 || formData.discountRate > 15) {
            alert("Discount rate must be between 5% and 15%");
            return;
        }
        if (!formData.startDate || !formData.endDate) {
            alert("Please provide start and end dates");
            return;
        }
        if (formData.applicableServiceTypes.length === 0) {
            alert("Please select at least one service type");
            return;
        }

        const newPromo: BranchPromotion = {
            id: editingPromo?.id || `promo-branch-${Date.now()}`,
            branchId: formData.branchId,
            description: formData.description.trim(),
            targetAudience: formData.targetAudience,
            applicableServiceTypes: formData.applicableServiceTypes,
            discountRate: formData.discountRate,
            startDate: formData.startDate,
            endDate: formData.endDate,
            isActive: new Date() >= new Date(formData.startDate) && new Date() <= new Date(formData.endDate),
            createdAt: editingPromo?.createdAt || new Date().toISOString(),
        };

        let updated: BranchPromotion[];
        if (editingPromo) {
            updated = promotions.map((p) => (p.id === editingPromo.id ? newPromo : p));
        } else {
            updated = [...promotions, newPromo];
        }

        localStorage.setItem("petcare_branch_promotions", JSON.stringify(updated));
        setPromotions(updated);
        handleCloseDialog();
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this promotion?")) {
            const updated = promotions.filter((p) => p.id !== id);
            localStorage.setItem("petcare_branch_promotions", JSON.stringify(updated));
            setPromotions(updated);
        }
    };

    const getBranchName = (branchId: string) => {
        return branches.find(b => b.id === branchId)?.name || branchId;
    };

    const filteredPromotions = selectedBranch === "all"
        ? promotions
        : promotions.filter(p => p.branchId === selectedBranch);

    const serviceTypeOptions: { id: ServiceTypeId; label: string }[] = [
        { id: "purchase", label: "Mua hàng" },
        { id: "single-vaccine", label: "Tiêm mũi lẻ" },
        { id: "vaccine-package", label: "Tiêm theo gói" },
        { id: "medical-exam", label: "Khám bệnh" },
    ];

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Branch Promotions Management</h1>
                    <p className="text-muted-foreground">
                        Manage branch-specific promotional campaigns
                    </p>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <div>
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
                        <Badge variant="outline" className="text-sm">
                            Total: {filteredPromotions.length}
                        </Badge>
                    </div>
                    <Button onClick={() => handleOpenDialog()} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Branch Promotion
                    </Button>
                </div>

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Branch</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Audience</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Period</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPromotions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                        No branch promotions found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPromotions.map((promo) => (
                                    <TableRow key={promo.id}>
                                        <TableCell>
                                            <Badge variant="outline">{getBranchName(promo.branchId)}</Badge>
                                        </TableCell>
                                        <TableCell className="font-medium max-w-xs truncate">
                                            <div className="flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-primary" />
                                                {promo.description}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{promo.targetAudience}</Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">{promo.discountRate}%</TableCell>
                                        <TableCell className="text-sm">
                                            {promo.startDate} ~ {promo.endDate}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={promo.isActive ? "default" : "secondary"}>
                                                {promo.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenDialog(promo)}
                                                    className="hover:bg-primary/10"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(promo.id)}
                                                    className="hover:bg-destructive/10 text-destructive"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editingPromo ? "Edit Branch Promotion" : "Add New Branch Promotion"}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Branch *</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-md"
                                    value={formData.branchId}
                                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                                    disabled={!!editingPromo}
                                >
                                    <option value="">Select branch</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description * (max 500 chars)</label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="e.g., Grand Opening Special"
                                    maxLength={500}
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Target Audience *</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-md"
                                        value={formData.targetAudience}
                                        onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as TargetAudience })}
                                    >
                                        <option value="All">All Customers</option>
                                        <option value="Loyal+">Loyal+ (Thân thiết & VIP)</option>
                                        <option value="VIP+">VIP+ (VIP Only)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Discount Rate * (5-15%)</label>
                                    <Input
                                        type="number"
                                        min="5"
                                        max="15"
                                        value={formData.discountRate}
                                        onChange={(e) => setFormData({ ...formData, discountRate: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Applicable Service Types *</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {serviceTypeOptions.map((opt) => (
                                        <label key={opt.id} className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                checked={formData.applicableServiceTypes.includes(opt.id)}
                                                onChange={() => handleServiceTypeToggle(opt.id)}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm">{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Start Date *</label>
                                    <Input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">End Date *</label>
                                    <Input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={handleCloseDialog}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit}>
                                {editingPromo ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
