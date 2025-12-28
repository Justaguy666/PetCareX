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
import { Plus, Edit, Trash2, Percent, Calendar } from "lucide-react";
import { GlobalPromotion, ServiceTypeId, TargetAudience } from "@shared/types";

export default function GlobalPromotionsPage() {
    const { user } = useAuth();
    const [promotions, setPromotions] = useState<GlobalPromotion[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<GlobalPromotion | null>(null);
    const [formData, setFormData] = useState({
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
    }, []);

    const loadPromotions = () => {
        const stored = localStorage.getItem("petcare_global_promotions");
        if (stored) {
            setPromotions(JSON.parse(stored));
        }
    };

    const handleOpenDialog = (promo?: GlobalPromotion) => {
        if (promo) {
            setEditingPromo(promo);
            setFormData({
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
        if (!formData.description.trim() || formData.description.length > 500) {
            alert("Description is required (max 500 chars)");
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
        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
            alert("End date must be after start date");
            return;
        }
        if (formData.applicableServiceTypes.length === 0) {
            alert("Please select at least one service type");
            return;
        }

        const newPromo: GlobalPromotion = {
            id: editingPromo?.id || `promo-global-${Date.now()}`,
            description: formData.description.trim(),
            targetAudience: formData.targetAudience,
            applicableServiceTypes: formData.applicableServiceTypes,
            discountRate: formData.discountRate,
            startDate: formData.startDate,
            endDate: formData.endDate,
            isActive: new Date() >= new Date(formData.startDate) && new Date() <= new Date(formData.endDate),
            createdAt: editingPromo?.createdAt || new Date().toISOString(),
        };

        let updated: GlobalPromotion[];
        if (editingPromo) {
            updated = promotions.map((p) => (p.id === editingPromo.id ? newPromo : p));
        } else {
            updated = [...promotions, newPromo];
        }

        localStorage.setItem("petcare_global_promotions", JSON.stringify(updated));
        setPromotions(updated);
        handleCloseDialog();
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this promotion?")) {
            const updated = promotions.filter((p) => p.id !== id);
            localStorage.setItem("petcare_global_promotions", JSON.stringify(updated));
            setPromotions(updated);
        }
    };

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
                    <h1 className="text-3xl font-bold text-foreground mb-2">Global Promotions Management</h1>
                    <p className="text-muted-foreground">
                        Manage system-wide promotions across all branches
                    </p>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <Badge variant="outline" className="text-sm">
                        Total: {promotions.length} | Active: {promotions.filter(p => p.isActive).length}
                    </Badge>
                    <Button onClick={() => handleOpenDialog()} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Promotion
                    </Button>
                </div>

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead>Audience</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Service Types</TableHead>
                                <TableHead>Period</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {promotions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                        No promotions found. Click "Add Promotion" to create one.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                promotions.map((promo) => (
                                    <TableRow key={promo.id}>
                                        <TableCell className="font-medium max-w-xs">
                                            <div className="flex items-center gap-2">
                                                <Percent className="w-4 h-4 text-primary" />
                                                <span className="truncate">{promo.description}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{promo.targetAudience}</Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">{promo.discountRate}%</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {promo.applicableServiceTypes.map((type, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                        {serviceTypeOptions.find(o => o.id === type)?.label}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {promo.startDate} ~ {promo.endDate}
                                            </div>
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
                                {editingPromo ? "Edit Global Promotion" : "Add New Global Promotion"}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description * (max 500 chars)</label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="e.g., New Year Special - 10% off all medical exams"
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
                                        placeholder="10"
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
