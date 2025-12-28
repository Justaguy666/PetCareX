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
import { Plus, Edit, Trash2, Boxes, X } from "lucide-react";
import { VaccinePackage, Vaccine, VaccineInPackage } from "@shared/types";

export default function VaccinePackagesPage() {
    const { user } = useAuth();
    const [packages, setPackages] = useState<VaccinePackage[]>([]);
    const [vaccines, setVaccines] = useState<Vaccine[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<VaccinePackage | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        monthMark: 0,
        cycle: 0,
        price: 0,
        description: "",
        vaccines: [] as VaccineInPackage[],
    });
    const [selectedVaccineId, setSelectedVaccineId] = useState("");
    const [selectedDosage, setSelectedDosage] = useState(1);

    if (!user || user.role !== "admin") {
        return <Navigate to="/login" />;
    }

    useEffect(() => {
        loadPackages();
        loadVaccines();
    }, []);

    const loadPackages = () => {
        const stored = localStorage.getItem("petcare_vaccine_packages");
        if (stored) {
            setPackages(JSON.parse(stored));
        }
    };

    const loadVaccines = () => {
        const stored = localStorage.getItem("petcare_vaccines");
        if (stored) {
            setVaccines(JSON.parse(stored));
        }
    };

    const handleOpenDialog = (pkg?: VaccinePackage) => {
        if (pkg) {
            setEditingPackage(pkg);
            setFormData({
                name: pkg.name,
                monthMark: pkg.monthMark,
                cycle: pkg.cycle,
                price: pkg.price,
                description: pkg.description || "",
                vaccines: pkg.vaccines,
            });
        } else {
            setEditingPackage(null);
            setFormData({
                name: "",
                monthMark: 0,
                cycle: 0,
                price: 0,
                description: "",
                vaccines: [],
            });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingPackage(null);
        setSelectedVaccineId("");
        setSelectedDosage(1);
    };

    const handleAddVaccine = () => {
        if (!selectedVaccineId) {
            alert("Please select a vaccine");
            return;
        }
        if (formData.vaccines.some(v => v.vaccineId === selectedVaccineId)) {
            alert("This vaccine is already in the package");
            return;
        }
        setFormData({
            ...formData,
            vaccines: [...formData.vaccines, { vaccineId: selectedVaccineId, dosage: selectedDosage }],
        });
        setSelectedVaccineId("");
        setSelectedDosage(1);
    };

    const handleRemoveVaccine = (vaccineId: string) => {
        setFormData({
            ...formData,
            vaccines: formData.vaccines.filter(v => v.vaccineId !== vaccineId),
        });
    };

    const handleSubmit = () => {
        if (!formData.name.trim() || formData.name.length > 200) {
            alert("Package name is required (max 200 chars)");
            return;
        }
        if (formData.monthMark <= 0) {
            alert("Month mark must be a positive integer");
            return;
        }
        if (formData.cycle <= 0) {
            alert("Cycle must be a positive integer");
            return;
        }
        if (formData.price <= 0) {
            alert("Price must be greater than 0");
            return;
        }
        if (formData.vaccines.length === 0) {
            alert("Please add at least one vaccine to the package");
            return;
        }

        const newPackage: VaccinePackage = {
            id: editingPackage?.id || `pkg-${Date.now()}`,
            name: formData.name.trim(),
            monthMark: formData.monthMark,
            cycle: formData.cycle,
            price: formData.price,
            vaccines: formData.vaccines,
            description: formData.description.trim(),
            createdAt: editingPackage?.createdAt || new Date().toISOString(),
        };

        let updated: VaccinePackage[];
        if (editingPackage) {
            updated = packages.map((p) => (p.id === editingPackage.id ? newPackage : p));
        } else {
            updated = [...packages, newPackage];
        }

        localStorage.setItem("petcare_vaccine_packages", JSON.stringify(updated));
        setPackages(updated);
        handleCloseDialog();
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this package?")) {
            const updated = packages.filter((p) => p.id !== id);
            localStorage.setItem("petcare_vaccine_packages", JSON.stringify(updated));
            setPackages(updated);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const getVaccineName = (vaccineId: string) => {
        return vaccines.find(v => v.id === vaccineId)?.name || vaccineId;
    };

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Vaccine Packages Management</h1>
                    <p className="text-muted-foreground">
                        Manage vaccine packages with multiple doses and cycles
                    </p>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <Badge variant="outline" className="text-sm">
                        Total: {packages.length}
                    </Badge>
                    <Button onClick={() => handleOpenDialog()} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Package
                    </Button>
                </div>

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Package Name</TableHead>
                                <TableHead>Age (Months)</TableHead>
                                <TableHead>Cycles</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Vaccines</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {packages.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        No packages found. Click "Add Package" to create one.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                packages.map((pkg) => (
                                    <TableRow key={pkg.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Boxes className="w-4 h-4 text-primary" />
                                                {pkg.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>{pkg.monthMark} months</TableCell>
                                        <TableCell>{pkg.cycle} cycle(s)</TableCell>
                                        <TableCell className="font-medium">{formatCurrency(pkg.price)}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {pkg.vaccines.map((v, idx) => (
                                                    <Badge key={idx} variant="secondary" className="text-xs">
                                                        {getVaccineName(v.vaccineId)} x{v.dosage}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenDialog(pkg)}
                                                    className="hover:bg-primary/10"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(pkg.id)}
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
                                {editingPackage ? "Edit Vaccine Package" : "Add New Vaccine Package"}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Package Name * (max 200 chars)</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Puppy Starter Package"
                                        maxLength={200}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Price (VND) *</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        placeholder="800000"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Month Mark * (positive int)</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={formData.monthMark}
                                        onChange={(e) => setFormData({ ...formData, monthMark: Number(e.target.value) })}
                                        placeholder="2"
                                    />
                                    <p className="text-xs text-muted-foreground">Age in months for this package</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Cycle * (positive int)</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={formData.cycle}
                                        onChange={(e) => setFormData({ ...formData, cycle: Number(e.target.value) })}
                                        placeholder="3"
                                    />
                                    <p className="text-xs text-muted-foreground">Number of cycles to repeat</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description"
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Vaccines in Package *</label>
                                <div className="flex gap-2">
                                    <select
                                        className="flex-1 px-3 py-2 border rounded-md"
                                        value={selectedVaccineId}
                                        onChange={(e) => setSelectedVaccineId(e.target.value)}
                                    >
                                        <option value="">Select a vaccine</option>
                                        {vaccines.map((v) => (
                                            <option key={v.id} value={v.id}>
                                                {v.name}
                                            </option>
                                        ))}
                                    </select>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={selectedDosage}
                                        onChange={(e) => setSelectedDosage(Number(e.target.value))}
                                        placeholder="Dosage"
                                        className="w-24"
                                    />
                                    <Button type="button" onClick={handleAddVaccine} size="sm">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>

                                {formData.vaccines.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        {formData.vaccines.map((v, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                                <span className="text-sm">
                                                    {getVaccineName(v.vaccineId)} - {v.dosage} dose(s)
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveVaccine(v.vaccineId)}
                                                    className="hover:bg-destructive/10 text-destructive"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={handleCloseDialog}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit}>
                                {editingPackage ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
